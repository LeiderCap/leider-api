from fastapi import APIRouter
from scoring.eci import score_eci
from scoring.cci import score_cci

router = APIRouter()

@router.get("/{ticker}")
async def run_score(ticker: str):
    eci = score_eci(
        gross_margin=55,
        ebitda_margin=18,
        revenue_growth=12,
        insider_ownership_pct=9,
        institutional_ownership_pct=74,
        dilution_3y_pct=6,
        leverage_ratio=1.8,
    )

    cci = score_cci(
        voting_pct_insider=9,
        dual_class=False,
        float_pct=72,
        ev_to_mktcap=1.4,
        net_debt_to_ebitda=1.8,
        sector_stigma=55,
        multiple_gap=30,
    )

    return {
        "ticker": ticker.upper(),
        "framework": "Lens",
        "eci": eci,
        "cci": cci,
    }
