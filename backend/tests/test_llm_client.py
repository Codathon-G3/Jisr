import httpx
import pytest

from app.config import get_settings
from app.services.llm_client import LlmError, generate_json


def test_missing_key_does_not_echo_the_prompt(monkeypatch) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "")
    get_settings.cache_clear()
    with pytest.raises(LlmError) as caught:
        generate_json("system", "جملة خاصة لا تُطبع")
    assert caught.value.kind == "missing_key"
    assert "خاصة" not in str(caught.value)
    get_settings.cache_clear()


def test_timeout_is_reported_without_the_prompt(monkeypatch) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    get_settings.cache_clear()

    class TimeoutClient:
        def __init__(self, *args, **kwargs) -> None:
            pass

        def __enter__(self):
            return self

        def __exit__(self, *args) -> bool:
            return False

        def post(self, *args, **kwargs):
            raise httpx.TimeoutException("timed out")

    monkeypatch.setattr(httpx, "Client", TimeoutClient)
    with pytest.raises(LlmError) as caught:
        generate_json("system", "نص المستخدم")
    assert caught.value.kind == "timeout"
    assert "نص المستخدم" not in str(caught.value)
    get_settings.cache_clear()


def test_fenced_json_is_parsed(monkeypatch) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    get_settings.cache_clear()

    class JsonClient:
        def __init__(self, *args, **kwargs) -> None:
            pass

        def __enter__(self):
            return self

        def __exit__(self, *args) -> bool:
            return False

        def post(self, *args, **kwargs):
            request = httpx.Request("POST", "https://example.test")
            return httpx.Response(
                200,
                json={
                    "candidates": [
                        {
                            "content": {
                                "parts": [{"text": '```json\n{"text": "تمام"}\n```'}]
                            }
                        }
                    ]
                },
                request=request,
            )

    monkeypatch.setattr(httpx, "Client", JsonClient)
    assert generate_json("system", "اكتب") == {"text": "تمام"}
    get_settings.cache_clear()
