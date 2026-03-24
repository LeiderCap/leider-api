from fastapi import APIRouter
from scoring.eci import score_eci

router = APIRouter()

@router.get("/{ticker}")
async def run_score(ticker: str):
    result = score_eci(
        gross_margin=55,
        ebitda_margin=18,
        revenue_growth=12,
        insider_ownership_pct=9,
        institutional_ownership_pct=74,
        dilution_3y_pct=6,
        leverage_ratio=1.8,
    )
    return {
        "ticker": ticker.upper(),
        "framework": "ECI",
        "result": result
    }
