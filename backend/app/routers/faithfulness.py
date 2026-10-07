from fastapi import APIRouter

from app.schemas import FaithfulnessRequest, FaithfulnessResponse
from app.services.faithfulness import align_draft

router = APIRouter()


@router.post("/api/faithfulness", response_model=FaithfulnessResponse)
def post_faithfulness(body: FaithfulnessRequest) -> FaithfulnessResponse:
    return FaithfulnessResponse.model_validate(align_draft(body.originalText, body.draft))
