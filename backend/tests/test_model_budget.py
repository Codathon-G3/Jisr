import httpx
import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import create_app
from app.services.drafting import generate_drafts
from app.services.llm_client import LlmError, generate_json
from app.services.model_budget import ModelCallBudget, get_model_budget
from app.services.risk_check import assess_risk


class FakeClock:
    def __init__(self) -> None:
        self.now = 1000.0

    def __call__(self) -> float:
        return self.now


def test_per_minute_cap_and_window_slides() -> None:
    clock = FakeClock()
    budget = ModelCallBudget(per_minute=2, per_day=100, clock=clock)
    assert budget.try_acquire() is True
    assert budget.try_acquire() is True
    assert budget.try_acquire() is False
    clock.now += 60
    assert budget.try_acquire() is True


def test_per_day_cap() -> None:
    clock = FakeClock()
    budget = ModelCallBudget(per_minute=0, per_day=3, clock=clock)
    for _ in range(3):
        assert budget.try_acquire() is True
        clock.now += 61
    assert budget.try_acquire() is False
    clock.now += 86400
    assert budget.try_acquire() is True


def test_zero_turns_the_cap_off() -> None:
    budget = ModelCallBudget(per_minute=0, per_day=0, clock=FakeClock())
    assert all(budget.try_acquire() for _ in range(500))


@pytest.fixture
def one_call_budget(monkeypatch):
    """A live-looking key and a budget of one model call per minute."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("MODEL_CALLS_PER_MINUTE", "1")
    get_settings.cache_clear()
    get_model_budget.cache_clear()
    posts = []

    class CountingClient:
        def __init__(self, *args, **kwargs) -> None:
            pass

        def __enter__(self):
            return self

        def __exit__(self, *args) -> bool:
            return False

        def post(self, *args, **kwargs):
            posts.append(kwargs)
            request = httpx.Request("POST", "https://example.test")
            return httpx.Response(
                200,
                json={"candidates": [{"content": {"parts": [{"text": '{"riskDetected": false}'}]}}]},
                request=request,
            )

    monkeypatch.setattr(httpx, "Client", CountingClient)
    yield posts
    get_settings.cache_clear()
    get_model_budget.cache_clear()


def test_budget_stops_the_call_before_it_is_sent(one_call_budget) -> None:
    assert generate_json("system", "اكتب") == {"riskDetected": False}
    with pytest.raises(LlmError) as caught:
        generate_json("system", "اكتب")
    assert caught.value.kind == "rate_limited"
    assert len(one_call_budget) == 1


def test_spent_budget_keeps_the_risk_check_fail_closed(one_call_budget) -> None:
    generate_json("system", "اكتب")
    assert assess_risk("عندي ضغط كبير من قراية الامتحانات") == {"riskDetected": True, "method": "model"}


def test_spent_budget_gives_plain_templates(one_call_budget) -> None:
    generate_json("system", "اكتب")
    result = generate_drafts("عندي امتحان بكرة", ["exams"], "friend")
    assert result["usedFallbackTemplate"] is True
    assert result["riskDetected"] is False
    assert [draft["tone"] for draft in result["drafts"]] == ["gentle", "direct", "formal"]
    assert len(one_call_budget) == 1


def test_spent_budget_still_catches_phrase_risk(one_call_budget) -> None:
    generate_json("system", "اكتب")
    result = generate_drafts("خلاص ما نقدر نكمل ونبي نموت", ["exams"], "friend")
    assert result["riskDetected"] is True
    assert result["riskMethod"] == "phrase"
    assert result["drafts"] == []


@pytest.mark.parametrize(
    ("path", "body"),
    [
        ("/api/check-risk", {"text": "ا" * 4001}),
        ("/api/generate-drafts", {"text": "ا" * 4001, "recipient": "friend"}),
        ("/api/faithfulness", {"originalText": "ا" * 4001, "draft": "تمام"}),
        ("/api/faithfulness", {"originalText": "تمام", "draft": "ا" * 4001}),
    ],
)
def test_oversized_text_is_rejected_before_the_model(path, body, monkeypatch) -> None:
    def fail_if_called(system_prompt: str, user_prompt: str) -> dict:
        raise AssertionError("model should not be called")

    for module in ("risk_check", "drafting", "faithfulness"):
        monkeypatch.setattr(f"app.services.{module}.generate_json", fail_if_called)
    response = TestClient(create_app()).post(path, json=body)
    assert response.status_code == 422
