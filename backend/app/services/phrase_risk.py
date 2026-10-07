import re
from typing import Literal, TypedDict

from app.services.safety_loader import load_safety_json

PhraseMethod = Literal["phrase", "none"]

# Must stay identical to safety/lib/normalize.mjs (Person 3), so the evaluation
# scripts and the live API match text in exactly the same way.
_DIACRITICS = re.compile(r"[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]")  # marks + tatweel
_ALEF = re.compile("[أإآٱ]")
_APOSTROPHES = re.compile(r"[’'`]")
_NON_WORD = re.compile(r"[^\w\s]|_")  # punctuation and emoji -> space
_WHITESPACE = re.compile(r"\s+")

# Used only if crisis-phrases.json has no "benign_idioms" list (e.g. old placeholder files).
_DEFAULT_BENIGN_IDIOMS = ("نموت من الضحك",)


class PhraseRiskResult(TypedDict):
    detected: bool
    method: PhraseMethod


def normalize_text(text: str) -> str:
    t = _DIACRITICS.sub("", str(text or ""))
    t = _ALEF.sub("ا", t).replace("ى", "ي").replace("ة", "ه")
    t = t.lower()
    t = _APOSTROPHES.sub("", t)
    t = _NON_WORD.sub(" ", t)
    return _WHITESPACE.sub(" ", t).strip()


def check_phrase_risk(text: str) -> PhraseRiskResult:
    if not str(text or "").strip():
        return {"detected": False, "method": "none"}

    payload = load_safety_json("crisis-phrases.json")
    payload = payload if isinstance(payload, dict) else {}
    cleaned = _strip_benign_idioms(normalize_text(text), payload)
    if _matching_phrases(cleaned, payload):
        return {"detected": True, "method": "phrase"}
    return {"detected": False, "method": "none"}


def _strip_benign_idioms(normalized_text: str, payload: dict) -> str:
    """Remove only the exact harmless idiom spans (e.g. نموت من الضحك).
    The rest of the text is still checked, and the model judge still sees everything."""
    idioms = payload.get("benign_idioms") or _DEFAULT_BENIGN_IDIOMS
    padded = f" {normalized_text} "
    for idiom in idioms:
        normalized_idiom = normalize_text(str(idiom))
        if normalized_idiom:
            padded = padded.replace(normalized_idiom, " ")
    return _WHITESPACE.sub(" ", padded).strip()


def _matching_phrases(normalized_text: str, payload: dict) -> list[str]:
    matched: list[str] = []
    for phrase in payload.get("phrases", []):
        raw = phrase.get("text", "") if isinstance(phrase, dict) else ""
        normalized_phrase = normalize_text(str(raw))
        if normalized_phrase and normalized_phrase in normalized_text:
            matched.append(normalized_phrase)
    return matched
