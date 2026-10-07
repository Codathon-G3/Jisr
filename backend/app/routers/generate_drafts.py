from fastapi import APIRouter

from app.schemas import GenerateDraftsRequest, GenerateDraftsResponse
from app.services.drafting import generate_drafts

router = APIRouter()


@router.post("/api/generate-drafts", response_model=GenerateDraftsResponse)
def post_generate_drafts(body: GenerateDraftsRequest) -> GenerateDraftsResponse:
    result = generate_drafts(body.text, list(body.chips), body.recipient)
    return GenerateDraftsResponse.model_validate(result)
