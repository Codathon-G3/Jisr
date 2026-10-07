import re
from typing import Literal, TypedDict

from app.services.safety_loader import load_safety_json

PhraseMethod = Literal["phrase", "none"]

_DIACRITICS = re.compile(r"[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]")
_ALEF = re.compile("[أإآٱ]")
_WHITESPACE = re.compile(r"\s+")
_LAUGHTER_TAIL = "من الضحك"
_LAUGHTER_STEMS = frozenset({"نبي نموت", "ابي اموت"})


class PhraseRiskResult(TypedDict):
    detected: bool
    method: PhraseMethod


def normalize_text(text: str) -> str:
    without_marks = _DIACRITICS.sub("", text)
    unified_alef = _ALEF.sub("ا", without_marks)
    lowered = unified_alef.lower()
    return _WHITESPACE.sub(" ", lowered).strip()


def check_phrase_risk(text: str) -> PhraseRiskResult:
    if text.strip() == "":
        return {"detected": False, "method": "none"}

    normalized_text = normalize_text(text)
    matched = _matching_phrases(normalized_text)
    if not matched or _is_laughter_idiom(normalized_text, matched):
        return {"detected": False, "method": "none"}
    return {"detected": True, "method": "phrase"}


def _matching_phrases(normalized_text: str) -> list[str]:
    payload = load_safety_json("crisis-phrases.json")
    phrases = payload.get("phrases", []) if isinstance(payload, dict) else []
    matched: list[str] = []
    for phrase in phrases:
        raw = phrase.get("text", "") if isinstance(phrase, dict) else ""
        normalized_phrase = normalize_text(str(raw))
        if normalized_phrase and normalized_phrase in normalized_text:
            matched.append(normalized_phrase)
    return matched


def _is_laughter_idiom(normalized_text: str, matched: list[str]) -> bool:
    """Keep a colloquial joke off the phrase layer. The model judges it later."""
    if _LAUGHTER_TAIL not in normalized_text:
        return False
    return all(phrase in _LAUGHTER_STEMS for phrase in matched)
