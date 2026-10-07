import json
import logging
import os
from pathlib import Path
from typing import Any

from app.config import BACKEND_DIR

logger = logging.getLogger(__name__)

SAFETY_DIR = BACKEND_DIR.parent / "safety"
PLACEHOLDER_DIR = BACKEND_DIR / "data" / "placeholders"


def load_safety_json(filename: str) -> Any:
    for path in _candidate_paths(filename):
        if path.is_file():
            if path.parent == PLACEHOLDER_DIR:
                # Never fall back silently: the placeholders are old, shorter lists.
                if os.getenv("REQUIRE_SAFETY_DIR") == "1":
                    raise FileNotFoundError(f"safety/{filename} missing and placeholders are not allowed")
                logger.warning("Using PLACEHOLDER safety file %s (safety/ not found)", filename)
            with path.open(encoding="utf-8") as handle:
                return json.load(handle)
    raise FileNotFoundError(f"safety file not found: {filename}")


def safety_source(filename: str = "crisis-phrases.json") -> str:
    """'safety' or 'placeholder' — handy for a /health endpoint to prove which lists are live."""
    for path in _candidate_paths(filename):
        if path.is_file():
            return "placeholder" if path.parent == PLACEHOLDER_DIR else "safety"
    return "missing"


def _candidate_paths(filename: str) -> tuple[Path, Path]:
    return (SAFETY_DIR / filename, PLACEHOLDER_DIR / filename)
