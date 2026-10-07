from app.services.output_check import check_drafts


def test_clinical_term_fails_the_check() -> None:
    result = check_drafts(["أحس باكتئاب هذه الأيام"])
    assert result["passed"] is False
    assert "اكتئاب" in result["flaggedTerms"]
    assert "condition" in result["categories"]


def test_ordinary_exam_pressure_passes() -> None:
    result = check_drafts(["عندي ضغط من الامتحانات ونبي نحكي معاك"])
    assert result["passed"] is True
    assert result["flaggedTerms"] == []
