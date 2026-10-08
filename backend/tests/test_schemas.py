import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import create_app
from app.schemas import CheckRiskRequest, GenerateDraftsRequest, GenerateDraftsResponse


def test_health_returns_ok() -> None:
    client = TestClient(create_app())
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_check_risk_request_accepts_valid_payload() -> None:
    payload = CheckRiskRequest.model_validate(
        {
            "text": "ما نقدرش نكمل مع الامتحانات",
            "chips": ["exams"],
            "language": "ar",
        }
    )
    assert payload.text.startswith("ما")
    assert payload.chips == ["exams"]
    assert payload.language == "ar"


def test_check_risk_request_accepts_empty_text() -> None:
    payload = CheckRiskRequest.model_validate({"text": "", "chips": []})
    assert payload.text == ""
    assert payload.language == "ar"


def test_generate_drafts_rejects_unknown_recipient() -> None:
    with pytest.raises(ValidationError):
        GenerateDraftsRequest.model_validate(
            {
                "text": "عندي ضغط",
                "chips": ["exams"],
                "recipient": "teacher",
            }
        )


def test_generate_drafts_response_allows_no_drafts_only_on_risk() -> None:
    risk = GenerateDraftsResponse.model_validate(
        {
            "sanitisedText": "نص",
            "identifiersRemoved": [],
            "drafts": [],
            "outputCheckPassed": True,
            "usedFallbackTemplate": False,
            "riskDetected": True,
            "riskMethod": "model",
        }
    )
    assert risk.drafts == []
    with pytest.raises(ValidationError):
        GenerateDraftsResponse.model_validate(
            {
                "sanitisedText": "نص",
                "identifiersRemoved": [],
                "drafts": [],
                "outputCheckPassed": True,
                "usedFallbackTemplate": False,
            }
        )


def test_generate_drafts_response_requires_three_tones_in_order() -> None:
    with pytest.raises(ValidationError):
        GenerateDraftsResponse.model_validate(
            {
                "sanitisedText": "نص",
                "identifiersRemoved": [],
                "drafts": [
                    {"tone": "formal", "text": "أ"},
                    {"tone": "direct", "text": "ب"},
                    {"tone": "gentle", "text": "ج"},
                ],
                "outputCheckPassed": True,
                "usedFallbackTemplate": False,
            }
        )
