from app.services.drafting import generate_drafts
from app.services.llm_client import LlmError


def _clean_payload() -> dict:
    return {
        "drafts": [
            {"tone": "gentle", "text": "أنا نحس بضغط من الامتحانات والقراية."},
            {"tone": "direct", "text": "أنا نحتاج نحكي معاك على ضغط الامتحانات."},
            {"tone": "formal", "text": "أود إخبارك أن الامتحانات تضغط علي."},
        ]
    }


def test_shared_example_removes_identifiers_and_returns_three_drafts(monkeypatch) -> None:
    monkeypatch.setattr("app.services.drafting.generate_json", lambda system_prompt, user_prompt: _clean_payload())
    result = generate_drafts("بابا ديما يضغط عليا في قرايتي ورقمي 0912345678", ["exams", "family"], "friend")
    assert result["sanitisedText"] == "[name] ديما يضغط عليا في قرايتي ورقمي [phone]"
    assert result["usedFallbackTemplate"] is False
    assert result["outputCheckPassed"] is True
    assert [draft["tone"] for draft in result["drafts"]] == ["gentle", "direct", "formal"]


def test_clinical_output_retries_once_then_uses_templates(monkeypatch) -> None:
    calls = {"count": 0}

    def clinical(system_prompt: str, user_prompt: str) -> dict:
        calls["count"] += 1
        return {
            "drafts": [
                {"tone": "gentle", "text": "هذا اكتئاب"},
                {"tone": "direct", "text": "هذا اكتئاب"},
                {"tone": "formal", "text": "هذا اكتئاب"},
            ]
        }

    monkeypatch.setattr("app.services.drafting.generate_json", clinical)
    result = generate_drafts("", ["exams"], "friend")
    assert calls["count"] == 2
    assert result["usedFallbackTemplate"] is True
    assert result["outputCheckPassed"] is True
    assert "اكتئاب" not in " ".join(draft["text"] for draft in result["drafts"])


def test_model_failure_returns_templates_without_raising(monkeypatch) -> None:
    def explode(system_prompt: str, user_prompt: str) -> dict:
        raise LlmError("timeout")

    monkeypatch.setattr("app.services.drafting.generate_json", explode)
    result = generate_drafts("عندي ضغط", ["exams"], "friend")
    assert result["usedFallbackTemplate"] is True
    assert len(result["drafts"]) == 3
    assert "الامتحانات" in result["drafts"][0]["text"]
