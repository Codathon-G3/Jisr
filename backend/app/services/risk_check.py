from app.config import BACKEND_DIR
from app.services.llm_client import LlmError, generate_json
from app.services.phrase_risk import check_phrase_risk

_PROMPT_PATH = BACKEND_DIR / "prompts" / "risk-check.md"


def assess_risk(text: str) -> dict[str, object]:
    if text.strip() == "":
        return {"riskDetected": False, "method": "none"}

    phrase_hit = check_phrase_risk(text)["detected"]
    try:
        model_hit = _model_detects_risk(text)
    except LlmError:
        if phrase_hit:
            return {"riskDetected": True, "method": "phrase"}
        return {"riskDetected": True, "method": "model"}

    if phrase_hit and model_hit:
        method = "both"
    elif phrase_hit:
        method = "phrase"
    elif model_hit:
        method = "model"
    else:
        return {"riskDetected": False, "method": "none"}
    return {"riskDetected": True, "method": method}


def _model_detects_risk(text: str) -> bool:
    system_prompt = _PROMPT_PATH.read_text(encoding="utf-8")
    payload = generate_json(system_prompt, text)
    value = payload.get("riskDetected")
    if isinstance(value, bool):
        return value
    if isinstance(value, str) and value.strip().lower() in {"true", "false"}:
        return value.strip().lower() == "true"
    raise LlmError("bad_json")
