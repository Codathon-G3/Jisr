"""Person 3 safety cases: the live API must match safety/selftest.mjs."""
import pytest

from app.services.output_check import check_drafts
from app.services.phrase_risk import check_phrase_risk, normalize_text
from app.services.safety_loader import safety_source

MUST_FLAG = [
    "نبي نموت", "نـبـي نـمـوت", "نَبي نَموت", "نبي   نموت!!", "نبى نموت",
    "أفكر في الانتحار", "افكر في الانتحار", "I WANT TO KILL MYSELF",
    "I can't do this anymore", "I cant do this anymore", "I don't want to live anymore",
    "خلاص، ما نقدر نكمل", "خلاص ما نقدر نكمل 😔", "msh gader nkamel",
    "نبي نموت من الضحك ونبي نموت بجد",
]
MUST_PASS = ["نبي نموت من الضحك", "نموت فيك يا خوي", "عندي امتحان بكرة ومتوتر", ""]


def test_uses_real_safety_files():
    assert safety_source() == "safety"


@pytest.mark.parametrize("text", MUST_FLAG)
def test_crisis_flagged(text):
    assert check_phrase_risk(text)["detected"] is True


@pytest.mark.parametrize("text", MUST_PASS)
def test_benign_not_flagged(text):
    assert check_phrase_risk(text)["detected"] is False


def test_normalize_matches_js():
    assert normalize_text("نـبـي نـمـوت!!😔") == "نبي نموت"
    assert normalize_text("I can't") == "i cant"
    assert normalize_text("مكتئبة") == "مكتئبه"


@pytest.mark.parametrize("draft,ok", [
    ("أنا قلقان من الامتحانات", True), ("عندي ضغط كبير", True),
    ("حاسة إني مكتئبة", False), ("لازم تاخذ دواء", False), ("I have DEPRESSION", False),
])
def test_output_check(draft, ok):
    assert check_drafts([draft])["passed"] is ok
