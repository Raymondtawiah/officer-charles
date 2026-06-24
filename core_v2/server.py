from __future__ import annotations

import asyncio
import base64
import json
import os
import uuid
from pathlib import Path
from typing import Any

import requests
import websockets
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from .openai_client import CoreV2Error, chat_completion, openai_key
from .prompt_builder import VALID_MODES, VALID_VISA_TYPES, build_system_prompt, initial_user_message


ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / "core" / "project" / ".env")
load_dotenv(ROOT / ".env", override=True)

SESSION_TARGET = int(os.getenv("CORE_V2_SESSION_TARGET", "12"))
REALTIME_MODEL = os.getenv("CORE_V2_REALTIME_MODEL", "gpt-realtime")
REALTIME_URL = os.getenv("CORE_V2_REALTIME_URL", f"wss://api.openai.com/v1/realtime?model={REALTIME_MODEL}")
REALTIME_VOICE = os.getenv("CORE_V2_REALTIME_VOICE", "ash")
SAMPLE_RATE = int(os.getenv("CORE_V2_SAMPLE_RATE", "24000"))

app = FastAPI(title="Officer Charles Core V2")
live_sessions: dict[str, dict[str, Any]] = {}


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    content: str = Field(min_length=1, max_length=10000)
    history: list[ChatMessage] = []
    mode: str
    visa_type: str


class SessionRequest(BaseModel):
    mode: str
    visa_type: str
    visitor_id: str | None = None


def validate_selection(mode: str, visa_type: str) -> None:
    if mode not in VALID_MODES:
        raise HTTPException(status_code=422, detail="Invalid mode.")
    if visa_type not in VALID_VISA_TYPES:
        raise HTTPException(status_code=422, detail="Invalid visa_type.")


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "core_v2",
        "openai_configured": bool(os.getenv("OPENAI_KEY") or os.getenv("OPENAI_API_KEY")),
    }


@app.post("/chat")
def chat(request: ChatRequest) -> dict[str, str]:
    validate_selection(request.mode, request.visa_type)
    try:
        response = chat_completion(
            content=request.content,
            history=[message.model_dump() for message in request.history],
            mode=request.mode,
            visa_type=request.visa_type,
            session_target=SESSION_TARGET,
        )
    except CoreV2Error as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {"content": response}


@app.post("/sessions")
def create_session(request: SessionRequest) -> dict[str, str]:
    validate_selection(request.mode, request.visa_type)
    session_id = str(uuid.uuid4())
    live_sessions[session_id] = {
        "mode": request.mode,
        "visa_type": request.visa_type,
        "visitor_id": request.visitor_id,
    }
    return {"session_id": session_id}


def openai_headers() -> dict[str, str]:
    headers = {"Authorization": f"Bearer {openai_key()}"}
    safety_identifier = os.getenv("CORE_V2_SAFETY_IDENTIFIER")
    if safety_identifier:
        headers["OpenAI-Safety-Identifier"] = safety_identifier
    if os.getenv("CORE_V2_REALTIME_BETA_HEADER", "false").lower() in {"1", "true", "yes"}:
        headers["OpenAI-Beta"] = "realtime=v1"
    return headers


def session_update_event(instructions: str) -> dict[str, Any]:
    return {
        "type": "session.update",
        "session": {
            "type": "realtime",
            "instructions": instructions,
            "output_modalities": ["audio"],
            "audio": {
                "input": {
                    "format": {"type": "audio/pcm", "rate": SAMPLE_RATE},
                    "transcription": {"model": os.getenv("CORE_V2_TRANSCRIPTION_MODEL", "whisper-1")},
                    "turn_detection": None,
                },
                "output": {
                    "format": {"type": "audio/pcm", "rate": SAMPLE_RATE},
                    "voice": REALTIME_VOICE,
                },
            },
        },
    }


def response_create_event() -> dict[str, Any]:
    return {
        "type": "response.create",
        "response": {
            "output_modalities": ["audio"],
            "audio": {
                "output": {
                    "format": {"type": "audio/pcm", "rate": SAMPLE_RATE},
                    "voice": REALTIME_VOICE,
                },
            },
        },
    }


def text_item_event(text: str) -> dict[str, Any]:
    return {
        "type": "conversation.item.create",
        "item": {
            "type": "message",
            "role": "user",
            "content": [{"type": "input_text", "text": text}],
        },
    }


async def send_json(websocket: WebSocket, payload: dict[str, Any]) -> None:
    await websocket.send_text(json.dumps(payload))


async def forward_openai_to_browser(openai_ws: websockets.WebSocketClientProtocol, browser_ws: WebSocket) -> None:
    async for raw_message in openai_ws:
        if isinstance(raw_message, bytes):
            await browser_ws.send_text(base64.b64encode(raw_message).decode("ascii"))
            continue

        try:
            event = json.loads(raw_message)
        except json.JSONDecodeError:
            continue

        event_type = event.get("type")
        audio_delta = (
            event.get("delta")
            if event_type in {"response.audio.delta", "response.output_audio.delta"}
            else None
        )
        text_delta = (
            event.get("delta")
            if event_type in {"response.text.delta", "response.output_text.delta", "response.audio_transcript.delta", "response.output_audio_transcript.delta"}
            else None
        )
        transcript = None
        if event_type in {
            "conversation.item.input_audio_transcription.completed",
            "conversation.item.input_audio_transcription.done",
            "input_audio_transcription.completed",
        }:
            transcript = event.get("transcript") or event.get("item", {}).get("transcript")

        if audio_delta:
            await browser_ws.send_text(audio_delta)
        elif text_delta:
            await send_json(browser_ws, {"type": "text.delta", "delta": text_delta, "message": text_delta})
        elif transcript:
            await send_json(browser_ws, {"type": "transcription", "message": transcript})
        elif event_type in {"response.text.done", "response.output_text.done", "response.audio_transcript.done", "response.output_audio_transcript.done", "response.done"}:
            await send_json(browser_ws, {"type": "text.completed"})
        elif event_type == "error":
            await send_json(browser_ws, {"type": "error", "message": event.get("error", {}).get("message", "OpenAI realtime error.")})


async def forward_browser_to_openai(browser_ws: WebSocket, openai_ws: websockets.WebSocketClientProtocol) -> None:
    while True:
        try:
            message = await browser_ws.receive()
        except RuntimeError:
            return

        if message.get("type") == "websocket.disconnect":
            return

        if message.get("bytes") is not None:
            audio = base64.b64encode(message["bytes"]).decode("ascii")
            await openai_ws.send(json.dumps({"type": "input_audio_buffer.append", "audio": audio}))
            continue

        text = message.get("text")
        if text is None:
            continue

        try:
            payload = json.loads(text)
        except json.JSONDecodeError:
            continue

        if payload.get("_bin"):
            await openai_ws.send(json.dumps({"type": "input_audio_buffer.append", "audio": payload["_bin"]}))
            continue

        if payload.get("type") != "command":
            continue

        command = payload.get("command")
        if command == "commit":
            await openai_ws.send(json.dumps({"type": "input_audio_buffer.commit"}))
            await openai_ws.send(json.dumps(response_create_event()))
        elif command == "text":
            text_payload = str(payload.get("payload", "")).strip()
            if text_payload:
                await openai_ws.send(json.dumps(text_item_event(text_payload)))
                await openai_ws.send(json.dumps(response_create_event()))
        elif command == "response.cancel":
            await openai_ws.send(json.dumps({"type": "response.cancel"}))


@app.websocket("/ws/{session_id}")
async def websocket_session(websocket: WebSocket, session_id: str) -> None:
    await websocket.accept()
    session = live_sessions.get(session_id)
    if not session:
        await send_json(websocket, {"type": "error", "message": "Live session not found."})
        await websocket.close(code=1008)
        return

    instructions = build_system_prompt(session["mode"], session["visa_type"], 0, SESSION_TARGET)

    try:
        async with websockets.connect(
            REALTIME_URL,
            additional_headers=openai_headers(),
            max_size=8 * 1024 * 1024,
        ) as openai_ws:
            await openai_ws.send(json.dumps(session_update_event(instructions)))
            await openai_ws.send(json.dumps(text_item_event(initial_user_message(session["mode"], session["visa_type"]))))
            await openai_ws.send(json.dumps(response_create_event()))
            await send_json(websocket, {"type": "ready", "sample_rate": SAMPLE_RATE})

            tasks = [
                asyncio.create_task(forward_openai_to_browser(openai_ws, websocket)),
                asyncio.create_task(forward_browser_to_openai(websocket, openai_ws)),
            ]
            done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)

            for task in pending:
                task.cancel()
            for task in done:
                task.result()
    except WebSocketDisconnect:
        return
    except Exception as exc:
        try:
            await send_json(websocket, {"type": "error", "message": f"Live session failed: {exc}"})
        except RuntimeError:
            return


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "core_v2.server:app",
        host=os.getenv("CORE_V2_HOST", "127.0.0.1"),
        port=int(os.getenv("CORE_V2_PORT", "8010")),
        reload=os.getenv("CORE_V2_RELOAD", "false").lower() in {"1", "true", "yes"},
    )
