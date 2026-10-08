import pytest
from fastapi.testclient import TestClient

from app.main import create_app
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


@pytest.fixture
def risk_model(monkeypatch):
    """Controls the model layer of the Guardian gate inside /generate-drafts."""
    state = {"answer": False, "calls": 0, "seen": []}

    def answer(system_prompt: str, user_prompt: str) -> dict:
        state["calls"] += 1
        state["seen"].append(user_prompt)
        if isinstance(state["answer"], Exception):
            raise state["answer"]
        return {"riskDetected": state["answer"]}

    monkeypatch.setattr("app.services.risk_check.generate_json", answer)
    return state


def test_shared_example_removes_identifiers_and_returns_three_drafts(monkeypatch, risk_model) -> None:
    monkeypatch.setattr("app.services.drafting.generate_json", lambda system_prompt, user_prompt: _clean_payload())
    result = generate_drafts("بابا ديما يضغط عليا في قرايتي ورقمي 0912345678", ["exams", "family"], "friend")
    assert result["sanitisedText"] == "بابا ديما يضغط عليا في قرايتي ورقمي [phone]"
    assert result["usedFallbackTemplate"] is False
    assert result["outputCheckPassed"] is True
    assert result["riskDetected"] is False
    assert [draft["tone"] for draft in result["drafts"]] == ["gentle", "direct", "formal"]


def test_risk_model_only_sees_identifier_free_text(monkeypatch, risk_model) -> None:
    monkeypatch.setattr("app.services.drafting.generate_json", lambda system_prompt, user_prompt: _clean_payload())
    generate_drafts("اسمي أحمد ورقمي 0912345678 وعندي ضغط", ["exams"], "friend")
    assert risk_model["calls"] == 1
    assert "أحمد" not in risk_model["seen"][0]
    assert "0912345678" not in risk_model["seen"][0]


def test_phrase_risk_stops_drafting_before_any_model_call(monkeypatch, risk_model) -> None:
    def fail_if_called(system_prompt: str, user_prompt: str) -> dict:
        raise AssertionError("crisis text must never reach the drafting model")

    monkeypatch.setattr("app.services.drafting.generate_json", fail_if_called)
    result = generate_drafts("خلاص ما نقدر نكمل ونبي نموت", ["exams"], "friend")
    assert result["riskDetected"] is True
    assert result["riskMethod"] == "phrase"
    assert result["drafts"] == []
    assert risk_model["calls"] == 0


def test_model_risk_stops_drafting(monkeypatch, risk_model) -> None:
    def fail_if_called(system_prompt: str, user_prompt: str) -> dict:
        raise AssertionError("crisis text must never reach the drafting model")

    risk_model["answer"] = True
    monkeypatch.setattr("app.services.drafting.generate_json", fail_if_called)
    result = generate_drafts("الدنيا سوداء في عيني الفترة هادي", ["other"], "friend")
    assert result["riskDetected"] is True
    assert result["riskMethod"] == "model"
    assert result["drafts"] == []


def test_risk_model_down_returns_templates_not_a_crisis(monkeypatch, risk_model) -> None:
    def fail_if_called(system_prompt: str, user_prompt: str) -> dict:
        raise AssertionError("unchecked text must not reach the drafting model")

    risk_model["answer"] = LlmError("timeout")
    monkeypatch.setattr("app.services.drafting.generate_json", fail_if_called)
    result = generate_drafts("عندي ضغط كبير من الامتحانات", ["exams"], "friend")
    assert result["riskDetected"] is False
    assert result["usedFallbackTemplate"] is True
    assert len(result["drafts"]) == 3


def test_clinical_output_retries_once_then_uses_templates(monkeypatch, risk_model) -> None:
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


def test_model_failure_returns_templates_without_raising(monkeypatch, risk_model) -> None:
    def explode(system_prompt: str, user_prompt: str) -> dict:
        raise LlmError("timeout")

    monkeypatch.setattr("app.services.drafting.generate_json", explode)
    result = generate_drafts("عندي ضغط", ["exams"], "friend")
    assert result["usedFallbackTemplate"] is True
    assert len(result["drafts"]) == 3
    assert "الامتحانات" in result["drafts"][0]["text"]


def test_endpoint_returns_no_drafts_on_risk(monkeypatch, risk_model) -> None:
    client = TestClient(create_app())
    response = client.post(
        "/api/generate-drafts",
        json={"text": "نبي نموت", "chips": ["other"], "recipient": "friend"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["riskDetected"] is True
    assert body["drafts"] == []
