import logging
import time

from fastapi import Request

logger = logging.getLogger("bridge_note")


def setup_logging() -> None:
    if logger.handlers:
        return
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(levelname)s %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False


async def access_log_middleware(request: Request, call_next):
    started = time.perf_counter()
    status = 500
    try:
        response = await call_next(request)
        status = response.status_code
        return response
    finally:
        elapsed_ms = int((time.perf_counter() - started) * 1000)
        logger.info("path=%s status=%s elapsed_ms=%s", request.url.path, status, elapsed_ms)
