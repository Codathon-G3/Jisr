from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.logging_setup import access_log_middleware, setup_logging
from app.routers.check_risk import router as check_risk_router
from app.routers.faithfulness import router as faithfulness_router
from app.routers.generate_drafts import router as generate_drafts_router


def create_app() -> FastAPI:
    setup_logging()
    settings = get_settings()
    app = FastAPI(title="Bridge Note API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type"],
    )
    app.middleware("http")(access_log_middleware)
    app.include_router(check_risk_router)
    app.include_router(generate_drafts_router)
    app.include_router(faithfulness_router)

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
