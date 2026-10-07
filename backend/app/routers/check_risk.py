from fastapi import APIRouter

from app.schemas import CheckRiskRequest, CheckRiskResponse
from app.services.risk_check import assess_risk

router = APIRouter()


@router.post("/api/check-risk", response_model=CheckRiskResponse)
def post_check_risk(body: CheckRiskRequest) -> CheckRiskResponse:
    return CheckRiskResponse.model_validate(assess_risk(body.text))
