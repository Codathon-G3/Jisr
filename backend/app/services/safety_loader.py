import json
from pathlib import Path
from typing import Any

from app.config import BACKEND_DIR

SAFETY_DIR = BACKEND_DIR.parent / "safety"
PLACEHOLDER_DIR = BACKEND_DIR / "data" / "placeholders"


def load_safety_json(filename: str) -> Any:
    for path in _candidate_paths(filename):
        if path.is_file():
            with path.open(encoding="utf-8") as handle:
                return json.load(handle)
    raise FileNotFoundError(f"safety file not found: {filename}")


def _candidate_paths(filename: str) -> tuple[Path, Path]:
    return (SAFETY_DIR / filename, PLACEHOLDER_DIR / filename)
