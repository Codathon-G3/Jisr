import re
from typing import Literal, TypedDict

Placeholder = Literal["[name]", "[phone]", "[email]"]

_ARABIC_LETTER = r"[\u0600-\u06FF]"
_KINSHIP = (
    "والدتي",
    "والدي",
    "أختي",
    "اخوي",
    "بابا",
    "ماما",
    "أبيّ",
    "أبي",
    "أمي",
    "خوي",
)
_KINSHIP_RE = re.compile(
    rf"(?<!{_ARABIC_LETTER})(?:{'|'.join(re.escape(word) for word in sorted(_KINSHIP, key=len, reverse=True))})(?!{_ARABIC_LETTER})"
)
_PHONE_RE = re.compile(r"(?<!\d)(?:\+?218[\s-]?\d{2}[\s-]?\d{7}|09\d{8})(?!\d)")
_EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


class RemovedIdentifier(TypedDict):
    original: str
    placeholder: Placeholder


def remove_identifiers(text: str) -> tuple[str, list[RemovedIdentifier]]:
    if text == "":
        return "", []

    spans: list[tuple[int, int, Placeholder]] = []
    for pattern, placeholder in (
        (_EMAIL_RE, "[email]"),
        (_PHONE_RE, "[phone]"),
        (_KINSHIP_RE, "[name]"),
    ):
        for match in pattern.finditer(text):
            _add_span(spans, match.start(), match.end(), placeholder)

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


def _add_span(spans: list[tuple[int, int, Placeholder]], start: int, end: int, placeholder: Placeholder) -> None:
    for index, (existing_start, existing_end, _) in enumerate(spans):
        if end <= existing_start or start >= existing_end:
            continue
        if (end - start) > (existing_end - existing_start):
            spans[index] = (start, end, placeholder)
        return
    spans.append((start, end, placeholder))
