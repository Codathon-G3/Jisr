import json
import re
from typing import Literal

import httpx

from app.config import get_settings

LlmErrorKind = Literal["timeout", "http", "bad_json", "missing_key"]
_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE)


class LlmError(Exception):
    def __init__(self, kind: LlmErrorKind) -> None:
        self.kind = kind
        super().__init__(kind)


def generate_json(system_prompt: str, user_prompt: str) -> dict:
    settings = get_settings()
    if not settings.gemini_api_key.strip():
        raise LlmError("missing_key")

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.gemini_model}:generateContent"
    )
    body = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"},
    }
    try:
        with httpx.Client(timeout=settings.llm_timeout_seconds) as client:
            response = client.post(url, params={"key": settings.gemini_api_key}, json=body)
    except httpx.TimeoutException as exc:
        raise LlmError("timeout") from exc
    except httpx.HTTPError as exc:
        raise LlmError("http") from exc

    if response.status_code != 200:
        raise LlmError("http")
    return _parse_model_payload(response.json())


def _parse_model_payload(payload: object) -> dict:
    try:
        text = payload["candidates"][0]["content"]["parts"][0]["text"]  # type: ignore[index]
        parsed = json.loads(_strip_fences(str(text)))
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
        raise LlmError("bad_json") from exc
    if not isinstance(parsed, dict):
        raise LlmError("bad_json")
    return parsed


def _strip_fences(raw: str) -> str:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = _FENCE.sub("", cleaned).strip()
    return cleaned
