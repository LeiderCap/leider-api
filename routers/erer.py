import yfinance as yf
from typing import Optional
from fastapi import APIRouter
from scoring.eci import score_eci
from scoring.cci import score_cci

router = APIRouter()


# ======================
# ERER CORE ENDPOINT
# ======================
@router.get("/{ticker}/report")
async def run_erer_report(
    ticker: str,
    anchor: float,
    horizon: int,
    current_price: Optional[float] = None,
    shares_outstanding: Optional[int] = None,
):
    result = await run_erer(
        ticker,
        anchor,
        horizon,
        current_price,
        shares_outstanding,
    )

    unlock_score = result["diagnostic"]["unlock_score"]
    priority = result["diagnostic"]["priority"]
    primary_constraint = result["lens_read"]["primary_constraint"]
    board_message = result["lens_read"]["board_message"]

    if unlock_score >= 70:
        priority_bucket = "Immediate Action"
    elif unlock_score >= 50:
        priority_bucket = "Active Review"
    else:
        priority_bucket = "Monitor"

    if primary_constraint == "Control Friction":
        recommended_action = (
            "Review governance, ownership concentration, float dynamics, and control structure."
        )
    else:
        recommended_action = (
            "Review operating signal convertibility, capital allocation clarity, and market communication."
        )

    why_now = (
        f"{result['ticker']} shows a potential uplift of "
        f"${round(result['anchor_case']['uplift']/1e6, 1)}M "
        f"({round(result['anchor_case']['uplift_pct'], 1)}%) to the anchor case."
    )

    return {
        "ticker": result["ticker"],
        "report_type": "ERER Memo",
        "summary": result["anchor_case"],
        "diagnosis": result["diagnostic"],
        "lens": result["lens_read"],
        "why_now": why_now,
        "priority_bucket": priority_bucket,
        "recommended_action": recommended_action,
        "board_message": board_message,
        "priority": priority,
    }
