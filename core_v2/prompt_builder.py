from __future__ import annotations

from pathlib import Path


PROMPT_DIR = Path(__file__).resolve().parent / "prompts"
VALID_MODES = {"training", "interview"}
VALID_VISA_TYPES = {"f1", "b1_b2"}


def read_prompt(name: str) -> str:
    return (PROMPT_DIR / f"{name}.md").read_text(encoding="utf-8").strip()


def label_for_mode(mode: str) -> str:
    return "Training Session" if mode == "training" else "Real Interview Simulation"


def label_for_visa_type(visa_type: str) -> str:
    return "F-1 Student Visa" if visa_type == "f1" else "B1/B2 Visitor Visa"


def selection_override(mode: str, visa_type: str) -> str:
    return (
        "APPLICATION SELECTION OVERRIDE:\n"
        "The app has already selected mode and visa type. Do not ask the user to choose mode or visa type again. "
        f"Start and continue directly as {label_for_mode(mode)} for {label_for_visa_type(visa_type)}."
    )


def build_system_prompt(mode: str, visa_type: str, assistant_count: int = 0, session_target: int = 12) -> str:
    if mode not in VALID_MODES:
        raise ValueError(f"Invalid mode: {mode}")
    if visa_type not in VALID_VISA_TYPES:
        raise ValueError(f"Invalid visa_type: {visa_type}")

    mode_prompt = read_prompt("training_mode" if mode == "training" else "real_interview_mode")
    visa_prompt = read_prompt("f1_student_visa" if visa_type == "f1" else "b1_b2_visitor_visa")

    sections = [
        read_prompt("identity"),
        read_prompt("start_conversation"),
        selection_override(mode, visa_type),
        f"SELECTED MODE: {label_for_mode(mode)}",
        f"SELECTED VISA TYPE: {label_for_visa_type(visa_type)}",
        mode_prompt,
        visa_prompt,
        read_prompt("voice_style"),
    ]

    if mode == "interview":
        sections.append(read_prompt("evaluation"))
        sections.append(read_prompt("motivation"))
        remaining = max(session_target - assistant_count, 0)
        sections.append(
            "REAL INTERVIEW COMPLETION CONTROL:\n"
            f"- The target interview length is {session_target} officer questions.\n"
            "- Track the number of officer questions asked in this conversation.\n"
            f"- Assistant responses already given in this session: {assistant_count}.\n"
            f"- Questions remaining before final evaluation: {remaining}.\n"
            "- If the target is reached, provide the Interview Performance Report and motivational message now.\n"
            "- Otherwise ask exactly one realistic next question."
        )
    else:
        sections.append(
            "TRAINING RESPONSE FORMAT:\n"
            "Strengths:\n- ...\n\n"
            "Weaknesses:\n- ...\n\n"
            "Improvement Suggestions:\n- ...\n\n"
            "Retry:\n[Ask the applicant to answer the same question again.]"
        )

    return "\n\n---\n\n".join(sections)


def initial_user_message(mode: str, visa_type: str) -> str:
    return (
        f"The user selected {label_for_mode(mode)} and {label_for_visa_type(visa_type)}. "
        "Start the session now with the correct visa interview opening. Do not ask them to choose mode or visa type again."
    )
