import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from core.realtime.RealtimeCoreOpenAI import RealtimeCoreOpenAI
from core.util.classes.WSC import WSC
from core.util.functions.debug import d, debug
from core.util.functions.env import env


WELCOME_PROMPT = (
    'Welcome to Officer Charles. Choose your practice mode:\n'
    '1. Training Session\n'
    '2. Real Interview Simulation'
)

VISA_PROMPT = (
    'Choose your visa type:\n'
    '1. F-1 Student Visa\n'
    '2. B1/B2 Visitor Visa'
)

F1_OPENING = "Good morning. Please provide your passport and your Form I-20."
B1_B2_OPENING = "Good morning. Please provide your passport."

F1_QUESTIONS = [
    "Tell me about your academic background.",
    "Why did you choose this university?",
    "Why did you choose this program?",
    "Why do you want to study in the United States?",
    "What are your future career goals?",
    "How will you pay for your studies?",
    "Who is sponsoring your education?",
    "What ties do you have to your home country?",
    "Tell me about your previous education.",
    "Have you traveled internationally before?",
]

B1_B2_QUESTIONS = [
    "What is the purpose of your visit to the United States?",
    "Where will you be traveling in the United States?",
    "How long do you plan to stay?",
    "Who is paying for your trip?",
    "What is your current employment or business situation?",
    "What family ties do you have in your home country?",
    "What are your return plans?",
    "Tell me about your previous travel history.",
]


class LiveInterviewAssistant(RealtimeCoreOpenAI):
    DEBUG = 1

    def __init__(
        self,
        api_key=env("OPENAI_KEY", env("OPENAI_API_KEY", None)),
        setup=False,
        wss_host="127.0.0.1",
        wss_port=6123,
        text_only=False,
        use_default_plugins=False,
        **kwargs
    ):
        super().__init__(
            api_key=api_key,
            setup=False,
            wss_host=wss_host,
            wss_port=wss_port,
            use_default_plugins=use_default_plugins,
            text_only=text_only,
            **kwargs
        )

        self.DEBUG = 1
        self.core = self
        self.post_reply = False
        self.text_call = False
        self.modalities = ["text", "audio"]
        self.conversational_lang = "en"
        self.WSC_EVENT_HANDLERS.update({
            "response.output_audio.delta": self.rt_audio_delta_handler,
            "response.output_audio_transcript.delta": self.rt_response_transcription_delta,
            "response.output_audio_transcript.done": self.rt_assistant_reply_handler,
            "response.output_text.delta": self.rt_text_delta_handler,
            "response.output_text.done": self.rt_response_text_done,
        })

        self.use([
            "payload",
            "service",
            "local_storage",
        ])

        self.set_services({
            "unknown": self.service_start,
            "start": self.service_start,
            "mode_selection": self.service_mode_selection,
            "visa_selection": self.service_visa_selection,
            "training": self.service_training,
            "interview": self.service_interview,
        })
        self.set_service_resets(False)

        self.set_default_payload({
            "service_type": None,
            "selected_mode": None,
            "selected_visa_type": None,
            "user_answer": None,
            "answer_is_unclear": None,
            "wants_next_question": None,
            "cancel_current_request": None,
        })

        self.set_default_local_storage({
            "selected_mode": None,
            "selected_visa_type": None,
            "current_question": None,
            "question_index": 0,
            "answers": [],
            "training_answered_questions": [],
            "questions": [],
            "evaluation_done": False,
        })

        if setup:
            self.setup()

    def setup(self):
        is_setup = super().setup()
        self.tools_map["process_admin"] = self.handle_process_admin
        return is_setup

    def create_session(self):
        if not self.api_key:
            debug(f"[{self.CLASS_NAME}] FATAL: OpenAI API key is missing.")
            return False

        self.session = {"server_side": True}
        self.empherial_secret = self.api_key
        return True

    def setup_wsc(self):
        self.wsc_url = "wss://api.openai.com/v1/realtime?model=" + self.config.get("llm", "gpt-realtime-mini")
        self.wsc = WSC(
            self.wsc_url,
            header=[
                f"Authorization: Bearer {self.empherial_secret}",
            ],
            on_open=self.wsc_open,
            on_message=self.wsc_message,
            on_error=self.wsc_error,
            on_close=self.wsc_close,
        )

        if self.DEBUG:
            d(f"[{self.CLASS_NAME}] OpenAI Starting.")
        self.wsc.run_forever(threaded=True)
        if self.DEBUG:
            d(f"[{self.CLASS_NAME}] OpenAI Ready.")

    def wsc_open(self, ws):
        if self.wsc_waiting_for == "ws_open":
            self.wsc_waiting_for = None

        voice = self.voice or self.config.get("voice", "ash")
        self.wsc_send({
            "type": "session.update",
            "session": {
                "type": "realtime",
                "instructions": self.instructions,
                "tools": self.tools or [],
                "tool_choice": "auto" if self.tools else "none",
                "output_modalities": ["audio"],
                "audio": {
                    "input": {
                        "transcription": {"model": self.config.get("stt", "whisper-1")},
                        "turn_detection": {
                            "type": "server_vad",
                            "threshold": self.config.get("threshold", 0.5),
                            "prefix_padding_ms": self.config.get("prefix_padding_ms", 300),
                            "silence_duration_ms": self.config.get("silence_duration_ms", 500),
                        },
                    },
                    "output": {
                        "voice": voice,
                    },
                },
            },
        })

    def rt_request_reply(self, guidelines=None, reply=True):
        output_modalities = ["audio"]
        if self.text_call:
            output_modalities = ["text"]
            self.text_call = False

        self._ensure_response_done()
        if not reply:
            self.rt_call_next_function(toggle=False)
            return

        response = {
            "output_modalities": output_modalities,
            "tool_choice": "none",
        }
        if guidelines is not None:
            response["instructions"] = guidelines

        self.wsc_send({
            "type": "response.create",
            "response": response,
        })

    def rt_request_function(self):
        self.wsc_clearlog("response.output_item.added")
        self.wsc_clearlog("response.function_call_arguments.done")

        self._ensure_response_done()
        self.wsc_send({
            "type": "response.create",
            "response": {
                "output_modalities": ["text"],
                "tool_choice": "required",
                "tools": self.tools or [],
            },
        })

        name = None
        max_retries = 10
        retries = 0
        while not name and retries < max_retries:
            retries += 1
            self.wsc_wait("response.output_item.added", timeout=10)
            response_event_log = self.wsc_event_logs.get("response.output_item.added", {})
            if response_event_log is None:
                continue
            name = response_event_log.get("item", {}).get("name")

        if name is None:
            return

        self.wsc_wait("response.function_call_arguments.done")
        arguments = self.wsc_event_logs.get("response.function_call_arguments.done", {})
        if arguments is None:
            return

        arguments = json.loads(arguments.get("arguments", "{}"))
        self.function_called = True

        if name in self.tools_map:
            self.function_name = name
            self.function_arguments = arguments
            self.function_output = self.tools_map[name](arguments)

            if self.function_output:
                should_reply_now = self.pre_reply if self.next_pre_reply is None else self.next_pre_reply
                self.rt_request_reply(
                    guidelines=self.function_output,
                    reply=should_reply_now,
                )
        else:
            debug(f"[{self.CLASS_NAME}] WSC: Function called by OpenAI does not exist: {name}")

    def start_conversation(self):
        self.function_call_enabled = False

        def restore_function_call(payload):
            if payload.get("type") != "response.done":
                return
            self.function_call_enabled = True
            if restore_function_call in self.OPENAI_LISTENERS:
                self.OPENAI_LISTENERS.remove(restore_function_call)

        self.OPENAI_LISTENERS.append(restore_function_call)
        self._emit_session_state("mode_selection")
        self.rt_request_reply(self._say_exactly(WELCOME_PROMPT), True)

    def handle_process_admin(self, arguments):
        if arguments.get("cancel_current_request"):
            self.unlock_service(arguments, service_type="mode_selection", sub_category="choose mode")
            return self._say_exactly(WELCOME_PROMPT)

        self.sync_payload(arguments)
        service_type = arguments.get("service_type") or self._infer_service_type(arguments)
        self.sync_service({"service_type": service_type})
        return self.call_service(arguments)

    def service_start(self, arguments):
        self.unlock_service(arguments, service_type="mode_selection", sub_category="choose mode")
        return self._say_exactly(WELCOME_PROMPT)

    def service_mode_selection(self, arguments):
        selected_mode = self._normalize_mode(arguments.get("selected_mode") or arguments.get("user_answer"))
        if not selected_mode:
            return self._say_exactly(WELCOME_PROMPT)

        self.local_set("selected_mode", selected_mode)
        self.sync_service({"service_type": "visa_selection"})
        self.set_sub_category("choose visa")
        self._emit_session_state("visa_selection")
        return self._say_exactly(VISA_PROMPT)

    def service_visa_selection(self, arguments):
        selected_visa_type = self._normalize_visa_type(
            arguments.get("selected_visa_type") or arguments.get("user_answer")
        )
        if not selected_visa_type:
            return self._say_exactly(VISA_PROMPT)

        self.local_set("selected_visa_type", selected_visa_type)
        self.local_set("question_index", 0)
        self.local_set("answers", [])
        self.local_set("training_answered_questions", [])
        self.local_set("questions", self._questions_for_visa(selected_visa_type))
        self.local_set("evaluation_done", False)

        selected_mode = self.local_get("selected_mode")
        next_service = "training" if selected_mode == "training" else "interview"
        self.sync_service({"service_type": next_service})
        self.set_sub_category("active")

        opening = F1_OPENING if selected_visa_type == "f1" else B1_B2_OPENING
        if selected_mode == "training":
            first_question = self._current_question()
            self.local_set("current_question", first_question)
            self._emit_session_state("training")
            return (
                "[admin]: Start the selected Training Session. Say this opening exactly first: "
                f'"{opening}" Then ask this first practice question: "{first_question}" '
                "Do not provide feedback yet because the applicant has not answered."
            )

        self.local_set("current_question", self._current_question())
        self._emit_session_state("interview")
        return (
            "[admin]: Start the selected Real Interview Simulation. Stay in visa officer character. "
            f'Say this opening exactly and do not add coaching: "{opening}"'
        )

    def service_training(self, arguments):
        answer = self._answer_from(arguments)
        current_question = self.local_get("current_question") or self._current_question()
        self.local_set("current_question", current_question)

        if not answer:
            self._emit_session_state("training")
            return f'[admin]: Ask the applicant this practice question: "{current_question}"'

        if arguments.get("wants_next_question"):
            self._advance_question()
            current_question = self._current_question()
            self.local_set("current_question", current_question)
            self._emit_session_state("training")
            return f'[admin]: Move to the next training question. Ask: "{current_question}"'

        answered_questions = self.local_get("training_answered_questions") or []
        if current_question not in answered_questions:
            answered_questions.append(current_question)
            self.local_set("training_answered_questions", answered_questions)
        self._emit_session_state("training")
        return (
            "[admin]: The applicant answered this training question:\n"
            f"Question: {current_question}\n"
            f"Answer: {answer}\n\n"
            "Respond as a visa interview coach. Provide exactly these sections:\n"
            "1. Strengths\n"
            "- What the applicant did well\n"
            "2. Weaknesses\n"
            "- What was unclear\n"
            "- Missing information\n"
            "- Possible concerns\n"
            "3. Improvement Suggestions\n"
            "- How to make the answer clearer\n"
            "- How to communicate better\n"
            "4. Retry\n"
            f'Ask the applicant to answer this same question again: "{current_question}"\n'
            "Be supportive, explain mistakes, encourage honesty, and never create fake answers."
        )

    def service_interview(self, arguments):
        if self.local_get("evaluation_done"):
            self._emit_session_state("completed")
            return "[admin]: Tell the applicant the real interview simulation is complete and invite them to repeat the simulation if they want more practice."

        answer = self._answer_from(arguments)
        questions = self.local_get("questions") or self._questions_for_visa(self.local_get("selected_visa_type"))
        index = int(self.local_get("question_index") or 0)

        if not answer:
            self._emit_session_state("interview")
            return self._ask_interview_question(index, questions)

        answers = self.local_get("answers") or []
        current_question = questions[index] if index < len(questions) else questions[-1]
        answers.append({"question": current_question, "answer": answer})
        self.local_set("answers", answers)

        if arguments.get("answer_is_unclear"):
            self._emit_session_state("interview")
            return (
                "[admin]: Stay in realistic visa officer character. Do not coach. "
                "Ask one concise follow-up question because the applicant's last answer was unclear."
            )

        index += 1
        self.local_set("question_index", index)
        if index >= len(questions):
            self.local_set("evaluation_done", True)
            self._emit_session_state("evaluation")
            return self._evaluation_prompt(answers)

        self._emit_session_state("interview")
        return self._ask_interview_question(index, questions)

    def _ask_interview_question(self, index, questions):
        question = questions[index] if index < len(questions) else questions[-1]
        self.local_set("current_question", question)
        return (
            "[admin]: Continue the Real Interview Simulation. Do not give feedback, hints, or coaching. "
            f'Ask exactly one realistic officer question now: "{question}"'
        )

    def _evaluation_prompt(self, answers):
        return (
            "[admin]: The Real Interview Simulation is complete. Create an Interview Performance Report now. "
            "Do not ask another interview question. Never guarantee visa approval.\n\n"
            f"Interview answers:\n{answers}\n\n"
            "Include:\n"
            "1. Overall Performance Score with overall percentage.\n"
            "Categories: Communication (Clarity, Organization), Confidence (Calmness, Delivery), "
            "Purpose of Travel (Understanding, Explanation), Financial Explanation (Ability to explain funding), "
            "Consistency (Whether answers match each other).\n"
            "2. What Went Well: strong answers, good communication, progress.\n"
            "3. Areas To Improve: weak answers, missing details, unclear explanations.\n"
            "4. Recommended Next Steps: practice weak questions, improve explanations, repeat simulation, build confidence.\n"
            "End with a motivational message recognizing effort, encouraging improvement, building confidence, "
            "and reminding the applicant that practice helps."
        )

    def _infer_service_type(self, arguments):
        if not self.local_get("selected_mode"):
            return "mode_selection"
        if not self.local_get("selected_visa_type"):
            return "visa_selection"
        return "training" if self.local_get("selected_mode") == "training" else "interview"

    def _normalize_mode(self, value):
        value = str(value or "").strip().lower()
        if value in {"1", "training", "training session", "coach", "coach mode"}:
            return "training"
        if value in {"2", "interview", "real interview", "real interview simulation", "simulation"}:
            return "interview"
        return None

    def _normalize_visa_type(self, value):
        value = str(value or "").strip().lower().replace("-", "").replace("/", "")
        if value in {"1", "f1", "f 1", "student", "student visa", "f1 student visa"}:
            return "f1"
        if value in {"2", "b1b2", "b1 b2", "visitor", "visitor visa", "b1b2 visitor visa"}:
            return "b1_b2"
        return None

    def _questions_for_visa(self, visa_type):
        return F1_QUESTIONS if visa_type == "f1" else B1_B2_QUESTIONS

    def _current_question(self):
        questions = self.local_get("questions") or self._questions_for_visa(self.local_get("selected_visa_type"))
        index = int(self.local_get("question_index") or 0)
        return questions[index] if index < len(questions) else questions[-1]

    def _advance_question(self):
        questions = self.local_get("questions") or []
        index = min(int(self.local_get("question_index") or 0) + 1, max(len(questions) - 1, 0))
        self.local_set("question_index", index)

    def _answer_from(self, arguments):
        return str(arguments.get("user_answer") or "").strip()

    def _say_exactly(self, message):
        return f'[admin]: Say exactly this and nothing else:\n"{message}"'

    def _emit_session_state(self, phase=None):
        try:
            self.wss_send({
                "type": "session.state",
                "state": self.session_state(phase),
            })
        except Exception:
            pass

    def session_state(self, phase=None):
        selected_mode = self.local_get("selected_mode")
        selected_visa_type = self.local_get("selected_visa_type")
        questions = self.local_get("questions") or (
            self._questions_for_visa(selected_visa_type) if selected_visa_type else []
        )
        answers = self.local_get("answers") or []
        training_answered_questions = self.local_get("training_answered_questions") or []
        evaluation_done = bool(self.local_get("evaluation_done"))
        current_question = self.local_get("current_question")
        question_index = int(self.local_get("question_index") or 0)

        if not phase:
            if evaluation_done:
                phase = "completed"
            elif not selected_mode:
                phase = "mode_selection"
            elif not selected_visa_type:
                phase = "visa_selection"
            else:
                phase = "training" if selected_mode == "training" else "interview"

        if phase in {"evaluation", "completed"}:
            current_question = None

        answered_questions = (
            training_answered_questions
            if selected_mode == "training"
            else [item.get("question") for item in answers if item.get("question")]
        )

        current_question_index = 0
        if questions:
            if phase in {"evaluation", "completed"}:
                current_question_index = len(questions)
            else:
                current_question_index = min(question_index + 1, len(questions))

        return {
            "experience": "live",
            "phase": phase,
            "selected_mode": selected_mode,
            "selected_visa_type": selected_visa_type,
            "interview_status": phase,
            "current_question": current_question,
            "current_question_index": current_question_index,
            "total_questions": len(questions),
            "answered_questions": answered_questions,
            "last_answer_quality": None,
            "evaluation_ready": phase in {"evaluation", "completed"},
            "completed": phase == "completed" or evaluation_done,
        }
