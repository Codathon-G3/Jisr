import re
from functools import lru_cache
from typing import Literal, TypedDict

from app.services.safety_loader import load_safety_json

# Must stay identical to src/services/piiSanitizer.ts. Both read safety/identifiers.json
# and are checked against the same cases in tests/fixtures/pii-cases.json.

Placeholder = Literal["[name]", "[phone]", "[email]"]

_ARABIC_LETTER = "؀-ۿ"
_DIGIT = "0-9٠-٩۰-۹"  # Latin, Arabic-Indic and Persian digits
_EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
# 7+ digits, optionally split by single spaces or hyphens (Libyan mobiles, landlines, IDs).
_PHONE_RE = re.compile(rf"(?<![{_DIGIT}])\+?[{_DIGIT}](?:[ \-]?[{_DIGIT}]){{6,}}(?![{_DIGIT}])")
_HANDLE_RE = re.compile(r"(?<![A-Za-z0-9_@])@[A-Za-z0-9_.]{2,}")


class RemovedIdentifier(TypedDict):
    original: str
    placeholder: Placeholder


def remove_identifiers(text: str) -> tuple[str, list[RemovedIdentifier]]:
    if text == "":
        return "", []

    marker_ar, marker_latin, names_ar, names_latin = _name_patterns()
    spans: list[tuple[int, int, Placeholder]] = []
    for match in _EMAIL_RE.finditer(text):
        _add_span(spans, match.start(), match.end(), "[email]")
    for match in _PHONE_RE.finditer(text):
        _add_span(spans, match.start(), match.end(), "[phone]")
    for match in _HANDLE_RE.finditer(text):
        _add_span(spans, match.start(), match.end(), "[name]")
    # The word after "اسمي" / "my name is", and known names (keeping a و/ف/ب/ل/ك prefix).
    for pattern in (marker_ar, marker_latin, names_ar, names_latin):
        for match in pattern.finditer(text):
            _add_span(spans, match.start(2), match.end(2), "[name]")

    spans.sort(key=lambda item: item[0])
    pieces: list[str] = []
    removed: list[RemovedIdentifier] = []
    cursor = 0
    for start, end, placeholder in spans:
        pieces.append(text[cursor:start])
        pieces.append(placeholder)
        removed.append({"original": text[start:end], "placeholder": placeholder})
        cursor = end
    pieces.append(text[cursor:])
    return "".join(pieces), removed


@lru_cache
def _name_patterns() -> tuple[re.Pattern[str], re.Pattern[str], re.Pattern[str], re.Pattern[str]]:
    lists = load_safety_json("identifiers.json")
    marker_ar = re.compile(
        rf"(?<![{_ARABIC_LETTER}])({_alternation(lists['name_markers_ar'])})\s+([{_ARABIC_LETTER}]+)"
    )
    marker_latin = re.compile(
        rf"(?<![A-Za-z])({_alternation(lists['name_markers_latin'])})\s+([A-Za-z]+)",
        re.IGNORECASE,
    )
    names_ar = re.compile(
        rf"(?<![{_ARABIC_LETTER}])([وفبلك]?)({_alternation(lists['names_ar'])})(?![{_ARABIC_LETTER}])"
    )
    names_latin = re.compile(
        rf"(?<![A-Za-z])()({_alternation(lists['names_latin'])})(?![A-Za-z])",
        re.IGNORECASE,
    )
    return marker_ar, marker_latin, names_ar, names_latin


def _alternation(words: list[str]) -> str:
    return "|".join(re.escape(word) for word in sorted(words, key=len, reverse=True))


def _add_span(spans: list[tuple[int, int, Placeholder]], start: int, end: int, placeholder: Placeholder) -> None:
    for index, (existing_start, existing_end, _) in enumerate(spans):
        if end <= existing_start or start >= existing_end:
            continue
        if (end - start) > (existing_end - existing_start):
            spans[index] = (start, end, placeholder)
        return
    spans.append((start, end, placeholder))
