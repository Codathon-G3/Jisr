"""Process-wide cap on calls to the language model.

It stops one client sending requests in a loop from draining the shared model
quota (or, on a paid key, running up the bill). It only counts calls: it never
sees who made them, so no address or other identifier is kept.

When the cap is reached the model is treated as unavailable, exactly as if it
were down: /api/check-risk fails closed and /api/generate-drafts returns the
plain templates.
"""

import threading
import time
from collections import deque
from collections.abc import Callable
from functools import lru_cache

from app.config import get_settings

_MINUTE = 60.0
_DAY = 86400.0


class ModelCallBudget:
    def __init__(self, per_minute: int, per_day: int, clock: Callable[[], float] = time.monotonic) -> None:
        # A limit of 0 or less turns that window off.
        self._windows = [
            (_MINUTE, per_minute, deque()),
            (_DAY, per_day, deque()),
        ]
        self._lock = threading.Lock()
        self._clock = clock

    def try_acquire(self) -> bool:
        now = self._clock()
        with self._lock:
            for window, _, calls in self._windows:
                while calls and now - calls[0] >= window:
                    calls.popleft()
            if any(limit > 0 and len(calls) >= limit for _, limit, calls in self._windows):
                return False
            for _, limit, calls in self._windows:
                if limit > 0:
                    calls.append(now)
            return True


@lru_cache
def get_model_budget() -> ModelCallBudget:
    settings = get_settings()
    return ModelCallBudget(settings.model_calls_per_minute, settings.model_calls_per_day)
