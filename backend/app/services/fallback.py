from typing import TypedDict

from app.schemas import DRAFT_ORDER, Recipient
from app.services.safety_loader import load_safety_json

CHIP_TOPICS = {
    "exams": "الامتحانات",
    "family": "العائلة",
    "work": "العمل",
    "relationships": "العلاقات",
    "sleep": "النوم",
    "money": "المال",
    "other": "موضوع شخصي",
}
DEFAULT_RECIPIENT: Recipient = "friend"
DEFAULT_TOPIC = "موضوع شخصي"


class PlainDraft(TypedDict):
    tone: str
    text: str


def plain_drafts(recipient: str | None, chips: list[str] | None) -> list[PlainDraft]:
    recipient_key = recipient if recipient in _recipients() else DEFAULT_RECIPIENT
    topic = _topic_label(chips or [])
    templates = load_safety_json("plain-templates.json")
    drafts: list[PlainDraft] = []
    for tone in DRAFT_ORDER:
        template = str(templates[tone][recipient_key])
        text = template.replace("{topic}", topic).replace("[topic]", topic)
        drafts.append({"tone": tone, "text": text})
    return drafts


def _topic_label(chips: list[str]) -> str:
    names = [CHIP_TOPICS[chip] for chip in chips if chip in CHIP_TOPICS]
    if not names:
        return DEFAULT_TOPIC
    return " و ".join(names)


def _recipients() -> set[str]:
    return {"friend", "sibling", "parent", "trusted_adult", "counsellor"}
