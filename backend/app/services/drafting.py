from app.config import BACKEND_DIR
from app.schemas import DRAFT_ORDER
from app.services.fallback import CHIP_TOPICS, plain_drafts
from app.services.identifier_removal import remove_identifiers
from app.services.llm_client import LlmError, generate_json
from app.services.output_check import check_drafts

_PROMPT_PATH = BACKEND_DIR / "prompts" / "drafting.md"
_RETRY_NOTE = (
    "المحاولة السابقة احتوت لغة ممنوعة. "
    "تجنب أسماء الحالات والتشخيص والدواء والعلاج، ولا تكرر تلك الصياغة."
)
_RECIPIENTS = {
    "friend": "صديق",
    "sibling": "أخ أو أخت",
    "parent": "أحد الوالدين",
    "trusted_adult": "شخص كبير موثوق",
    "counsellor": "مرشد أو معلم",
}


def generate_drafts(text: str, chips: list[str], recipient: str) -> dict[str, object]:
    sanitised, removed = remove_identifiers(text)
    drafts = _accepted_model_drafts(sanitised, chips, recipient)
    if drafts is None:
        drafts = plain_drafts(recipient, chips)
        return _response(sanitised, removed, drafts, used_fallback=True)
    return _response(sanitised, removed, drafts, used_fallback=False)


def _accepted_model_drafts(sanitised: str, chips: list[str], recipient: str) -> list[dict[str, str]] | None:
    first = _call_model(sanitised, chips, recipient, retry=False)
    if first is None:
        return None
    if _is_clean(first):
        return first
    second = _call_model(sanitised, chips, recipient, retry=True)
    if second is not None and _is_clean(second):
        return second
    return None


def _call_model(sanitised: str, chips: list[str], recipient: str, retry: bool) -> list[dict[str, str]] | None:
    system_prompt = _PROMPT_PATH.read_text(encoding="utf-8")
    user_prompt = _user_prompt(sanitised, chips, recipient)
    if retry:
        user_prompt = f"{user_prompt}\n{_RETRY_NOTE}"
    try:
        payload = generate_json(system_prompt, user_prompt)
        return _ordered_drafts(payload)
    except (LlmError, ValueError):
        return None


def _user_prompt(sanitised: str, chips: list[str], recipient: str) -> str:
    topics = [CHIP_TOPICS[chip] for chip in chips if chip in CHIP_TOPICS] or ["موضوع شخصي"]
    written = sanitised.strip() or "(لا يوجد نص حر. اعتمد على الشرائح فقط.)"
    return (
        f"الشرائح: {' و '.join(topics)}\n"
        f"المستلم: {_RECIPIENTS.get(recipient, recipient)}\n"
        f"النص: {written}"
    )


def _ordered_drafts(payload: object) -> list[dict[str, str]]:
    if not isinstance(payload, dict) or not isinstance(payload.get("drafts"), list):
        raise ValueError("bad drafts")
    by_tone: dict[str, str] = {}
    for item in payload["drafts"]:
        if not isinstance(item, dict):
            raise ValueError("bad draft")
        tone = str(item.get("tone", "")).strip().lower()
        body = str(item.get("text", "")).strip()
        if tone not in DRAFT_ORDER or not body:
            raise ValueError("bad draft")
        by_tone[tone] = body
    if set(by_tone) != set(DRAFT_ORDER):
        raise ValueError("missing tone")
    return [{"tone": tone, "text": by_tone[tone]} for tone in DRAFT_ORDER]


def _is_clean(drafts: list[dict[str, str]]) -> bool:
    return check_drafts([draft["text"] for draft in drafts])["passed"]


def _response(
    sanitised: str,
    removed: list[dict[str, str]],
    drafts: list[dict[str, str]],
    used_fallback: bool,
) -> dict[str, object]:
    passed = _is_clean(drafts)
    return {
        "sanitisedText": sanitised,
        "identifiersRemoved": removed,
        "drafts": drafts,
        "outputCheckPassed": passed,
        "usedFallbackTemplate": used_fallback,
    }
