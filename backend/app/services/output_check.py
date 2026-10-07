from typing import TypedDict

from app.services.phrase_risk import normalize_text
from app.services.safety_loader import load_safety_json


class OutputCheckResult(TypedDict):
    passed: bool
    flaggedTerms: list[str]
    categories: list[str]


def check_drafts(drafts: list[str]) -> OutputCheckResult:
    flagged: list[str] = []
    categories: list[str] = []
    normalized_drafts = [normalize_text(draft) for draft in drafts]
    for term in _forbidden_terms():
        raw = str(term.get("text", ""))
        normalized_term = normalize_text(raw)
        if not normalized_term:
            continue
        if any(normalized_term in draft for draft in normalized_drafts):
            flagged.append(raw)
            categories.append(str(term.get("category", "")))
    return {"passed": not flagged, "flaggedTerms": flagged, "categories": categories}


def _forbidden_terms() -> list[dict]:
    payload = load_safety_json("forbidden-terms.json")
    terms = payload.get("terms", []) if isinstance(payload, dict) else []
    return [term for term in terms if isinstance(term, dict)]
