from fastapi.testclient import TestClient

from app.main import create_app
from app.services.llm_client import LlmError


def test_two_requests_do_not_share_results(monkeypatch) -> None:
    def answer(system_prompt: str, user_prompt: str) -> dict:
        detected = "نموت" in user_prompt
        return {"riskDetected": detected}

    monkeypatch.setattr("app.services.risk_check.generate_json", answer)
    client = TestClient(create_app())
    first = client.post("/api/check-risk", json={"text": "عندي امتحان بكرة", "chips": ["exams"]})
    second = client.post("/api/check-risk", json={"text": "نبي نموت", "chips": ["other"]})
    assert first.json()["riskDetected"] is False
    assert second.json()["riskDetected"] is True
    assert "نبي نموت" not in first.text


def test_alignment_drops_phrases_not_in_the_source(monkeypatch) -> None:
    def invented(system_prompt: str, user_prompt: str) -> dict:
        return {
            "alignments": [
                {"draftPhrase": "ضغط من الامتحانات", "inputPhrase": "نكمل مع الامتحانات"},
                {"draftPhrase": "قصة مخترعة", "inputPhrase": "شيء لم يُكتب"},
            ]
        }

    monkeypatch.setattr("app.services.faithfulness.generate_json", invented)
    client = TestClient(create_app())
    response = client.post(
        "/api/faithfulness",
        json={
            "originalText": "ما نقدرش نكمل مع الامتحانات",
            "draft": "حبيت نقولك إني عندي ضغط من الامتحانات",
        },
    )
    assert response.status_code == 200
    assert response.json()["alignments"] == [
        {"draftPhrase": "ضغط من الامتحانات", "inputPhrase": "نكمل مع الامتحانات"}
    ]


def test_model_failure_returns_empty_alignments(monkeypatch) -> None:
    def explode(system_prompt: str, user_prompt: str) -> dict:
        raise LlmError("timeout")

    monkeypatch.setattr("app.services.faithfulness.generate_json", explode)
    client = TestClient(create_app())
    response = client.post(
        "/api/faithfulness",
        json={"originalText": "الامتحانات", "draft": "ضغط الامتحانات"},
    )
    assert response.status_code == 200
    assert response.json() == {"alignments": []}
