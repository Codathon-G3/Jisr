from app.services.fallback import plain_drafts
from app.services.output_check import check_drafts


def test_friend_exam_templates_are_three_clean_drafts() -> None:
    drafts = plain_drafts("friend", ["exams"])
    assert [draft["tone"] for draft in drafts] == ["gentle", "direct", "formal"]
    assert all(draft["text"].strip() for draft in drafts)
    assert all("{topic}" not in draft["text"] and "[topic]" not in draft["text"] for draft in drafts)
    assert "الامتحانات" in drafts[0]["text"]
    checked = check_drafts([draft["text"] for draft in drafts])
    assert checked["passed"] is True


def test_missing_recipient_and_empty_chips_use_defaults() -> None:
    drafts = plain_drafts(None, [])
    assert len(drafts) == 3
    assert "موضوع شخصي" in drafts[0]["text"]


def test_several_chips_are_joined() -> None:
    drafts = plain_drafts("sibling", ["exams", "family"])
    assert "الامتحانات و العائلة" in drafts[1]["text"]
