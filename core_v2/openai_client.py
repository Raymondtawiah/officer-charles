from __future__ import annotations

import os
from typing import Any

import requests

from .prompt_builder import build_system_prompt, initial_user_message


OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions"


class CoreV2Error(RuntimeError):
    pass


def openai_key() -> str:
    key = os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_KEY")
    if not key:
        raise CoreV2Error("OPENAI_API_KEY or OPENAI_KEY is not configured.")
    return key


def chat_completion(
    content: str,
    history: list[dict[str, str]],
    mode: str,
    visa_type: str,
    session_target: int = 12,
) -> str:
    assistant_count = len([message for message in history if message.get("role") == "assistant"])
    system_prompt = build_system_prompt(mode, visa_type, assistant_count, session_target)

    messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]
    if not history:
        messages.append({"role": "user", "content": initial_user_message(mode, visa_type)})

    for message in history:
        role = message.get("role")
        if role in {"user", "assistant"}:
            messages.append({"role": role, "content": str(message.get("content", ""))})

    messages.append({"role": "user", "content": content})

    payload: dict[str, Any] = {
        "model": os.getenv("CORE_V2_TEXT_MODEL", "gpt-4.1-mini"),
        "messages": messages,
        "temperature": float(os.getenv("CORE_V2_TEMPERATURE", "0.7")),
    }

    try:
        response = requests.post(
            OPENAI_CHAT_COMPLETIONS_URL,
            headers={
                "Authorization": f"Bearer {openai_key()}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=int(os.getenv("CORE_V2_OPENAI_TIMEOUT", "60")),
        )
    except requests.RequestException as exc:
        raise CoreV2Error(f"Could not connect to OpenAI: {exc}") from exc

    if response.status_code >= 400:
        raise CoreV2Error(f"OpenAI chat request failed with status {response.status_code}: {response.text[:500]}")

    data = response.json()
    return data.get("choices", [{}])[0].get("message", {}).get("content") or "No response received."
