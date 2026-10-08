import json

import pytest

from app.config import BACKEND_DIR
from app.services.identifier_removal import remove_identifiers

# Same cases as tests/test-pii-sanitizer.mjs runs against the phone's sanitizer.
_SHARED_CASES = json.loads(
    (BACKEND_DIR.parent / "tests" / "fixtures" / "pii-cases.json").read_text(encoding="utf-8")
)["cases"]


@pytest.mark.parametrize("case", _SHARED_CASES, ids=lambda case: case["text"][:24] or "empty")
def test_shared_cases_match_the_phone(case) -> None:
    sanitised, removed = remove_identifiers(case["text"])
    assert sanitised == case["sanitised"]
    assert removed == case["removed"]


def test_family_words_are_kept_for_drafting() -> None:
    sanitised, removed = remove_identifiers("بابا ديما يضغط عليا وأمي قلقانة")
    assert sanitised == "بابا ديما يضغط عليا وأمي قلقانة"
    assert removed == []


def test_spaced_libyan_phone() -> None:
    sanitised, removed = remove_identifiers("رقمي 218 91 2345678")
    assert sanitised == "رقمي [phone]"
    assert removed[0]["original"] == "218 91 2345678"
    assert removed[0]["placeholder"] == "[phone]"


def test_short_numbers_are_not_phones() -> None:
    sanitised, removed = remove_identifiers("عندي 6 مواد و 123456 مش رقم")
    assert removed == []
    assert sanitised == "عندي 6 مواد و 123456 مش رقم"


def test_name_inside_a_longer_word_is_kept() -> None:
    sanitised, removed = remove_identifiers("المحمدية بعيدة")
    assert sanitised == "المحمدية بعيدة"
    assert removed == []


def test_empty_text() -> None:
    assert remove_identifiers("") == ("", [])
