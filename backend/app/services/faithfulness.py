from app.config import BACKEND_DIR
from app.services.llm_client import LlmError, generate_json
from app.services.phrase_risk import normalize_text

_PROMPT_PATH = BACKEND_DIR / "prompts" / "faithfulness.md"


def align_draft(original_text: str, draft: str) -> dict[str, list[dict[str, str]]]:
    try:
        payload = generate_json(_PROMPT_PATH.read_text(encoding="utf-8"), _user_prompt(original_text, draft))
    except LlmError:
        return {"alignments": []}
    return {"alignments": _kept_pairs(payload, original_text, draft)}


def _user_prompt(original_text: str, draft: str) -> str:
    return f"النص الأصلي:\n{original_text}\n\nالمسودة:\n{draft}"


def _kept_pairs(payload: object, original_text: str, draft: str) -> list[dict[str, str]]:
    if not isinstance(payload, dict) or not isinstance(payload.get("alignments"), list):
        return []
    original_norm = normalize_text(original_text)
    draft_norm = normalize_text(draft)
    kept: list[dict[str, str]] = []
    for item in payload["alignments"]:
        if not isinstance(item, dict):
            continue
        draft_phrase = str(item.get("draftPhrase", "")).strip()
        input_phrase = str(item.get("inputPhrase", "")).strip()
        if not draft_phrase or not input_phrase:
            continue
        if normalize_text(input_phrase) not in original_norm:
            continue
        if normalize_text(draft_phrase) not in draft_norm:
            continue
        kept.append({"draftPhrase": draft_phrase, "inputPhrase": input_phrase})
    return kept
