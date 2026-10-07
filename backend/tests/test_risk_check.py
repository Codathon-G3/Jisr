from fastapi.testclient import TestClient

from app.main import create_app
from app.services import risk_check
from app.services.llm_client import LlmError


def test_empty_text_skips_the_model(monkeypatch) -> None:
    def fail_if_called(system_prompt: str, user_prompt: str) -> dict:
        raise AssertionError("model should not be called")

    monkeypatch.setattr(risk_check, "generate_json", fail_if_called)
    assert risk_check.assess_risk("   ") == {"riskDetected": False, "method": "none"}


def test_phrase_and_model_combine(monkeypatch) -> None:
    monkeypatch.setattr(risk_check, "generate_json", lambda system_prompt, user_prompt: {"riskDetected": True})
    result = risk_check.assess_risk("خلاص ما نقدر نكمل ونبي نموت")
    assert result == {"riskDetected": True, "method": "both"}


def test_model_only_when_phrase_misses(monkeypatch) -> None:
    monkeypatch.setattr(risk_check, "generate_json", lambda system_prompt, user_prompt: {"riskDetected": True})
    result = risk_check.assess_risk("عندي ضغط كبير من قراية الامتحانات")
    assert result == {"riskDetected": True, "method": "model"}


def test_neither_layer_means_no_risk(monkeypatch) -> None:
    monkeypatch.setattr(risk_check, "generate_json", lambda system_prompt, user_prompt: {"riskDetected": False})
    result = risk_check.assess_risk("عندي ضغط كبير من قراية الامتحانات")
    assert result == {"riskDetected": False, "method": "none"}


def test_model_failure_keeps_a_phrase_hit(monkeypatch) -> None:
    def explode(system_prompt: str, user_prompt: str) -> dict:
        raise LlmError("timeout")

    monkeypatch.setattr(risk_check, "generate_json", explode)
    result = risk_check.assess_risk("خلاص ما نقدر نكمل ونبي نموت")
    assert result == {"riskDetected": True, "method": "phrase"}


def test_model_failure_without_a_phrase_still_flags_risk(monkeypatch) -> None:
    def explode(system_prompt: str, user_prompt: str) -> dict:
        raise LlmError("timeout")

    monkeypatch.setattr(risk_check, "generate_json", explode)
    result = risk_check.assess_risk("عندي ضغط كبير من قراية الامتحانات")
    assert result == {"riskDetected": True, "method": "model"}


def test_invalid_body_returns_422() -> None:
    client = TestClient(create_app())
    response = client.post("/api/check-risk", json={"text": "مرحبا", "chips": ["not-a-chip"]})
    assert response.status_code == 422


def test_access_log_omits_user_text(monkeypatch, caplog) -> None:
    monkeypatch.setattr(risk_check, "generate_json", lambda system_prompt, user_prompt: {"riskDetected": False})
    secret = "عندي ضغط كبير من قراية الامتحانات"
    client = TestClient(create_app())
    with caplog.at_level("INFO", logger="bridge_note"):
        response = client.post("/api/check-risk", json={"text": secret, "chips": ["exams"]})
    assert response.status_code == 200
    assert secret not in caplog.text
