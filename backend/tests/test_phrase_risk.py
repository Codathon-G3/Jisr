import json

import pytest

from app.services import safety_loader
from app.services.phrase_risk import check_phrase_risk


def test_dialect_crisis_phrase_is_detected() -> None:
    result = check_phrase_risk("خلاص ما نقدر نكمل ونبي نموت")
    assert result == {"detected": True, "method": "phrase"}


def test_ordinary_exam_stress_is_not_detected() -> None:
    result = check_phrase_risk("عندي ضغط كبير من قراية الامتحانات")
    assert result == {"detected": False, "method": "none"}


def test_latin_libyan_phrase_is_detected() -> None:
    result = check_phrase_risk("nabi nmot w khalas")
    assert result == {"detected": True, "method": "phrase"}


def test_laughter_idiom_is_left_for_the_model() -> None:
    result = check_phrase_risk("نبي نموت من الضحك")
    assert result == {"detected": False, "method": "none"}


def test_empty_text_is_not_a_phrase_risk() -> None:
    assert check_phrase_risk("   ") == {"detected": False, "method": "none"}


def test_loader_prefers_safety_directory(tmp_path, monkeypatch) -> None:
    safety_dir = tmp_path / "safety"
    safety_dir.mkdir()
    (safety_dir / "crisis-phrases.json").write_text(
        json.dumps({"phrases": [{"text": "from-safety"}]}),
        encoding="utf-8",
    )
    monkeypatch.setattr(safety_loader, "SAFETY_DIR", safety_dir)
    loaded = safety_loader.load_safety_json("crisis-phrases.json")
    assert loaded["phrases"][0]["text"] == "from-safety"


def test_loader_raises_when_file_is_missing(monkeypatch, tmp_path) -> None:
    monkeypatch.setattr(safety_loader, "SAFETY_DIR", tmp_path / "missing-safety")
    monkeypatch.setattr(safety_loader, "PLACEHOLDER_DIR", tmp_path / "missing-placeholders")
    with pytest.raises(FileNotFoundError, match="not-a-file.json"):
        safety_loader.load_safety_json("not-a-file.json")
