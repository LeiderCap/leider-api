import yfinance as yf
from typing import Optional
from fastapi import APIRouter
from scoring.eci import score_eci
from scoring.cci import score_cci

router = APIRouter()


@router.get("/{ticker}")
async def run_erer(
    ticker: str,
    anchor: float,
    horizon: int,
    current_price: Optional[float] = None,
    shares_outstanding: Optional[int] = None,
):
    symbol = ticker.upper()

    info = {}
    try:
        t = yf.Ticker(symbol)
        info = t.info or {}
    except Exception:
        info = {}

    live_price = info.get("currentPrice") or info.get("regularMarketPrice") or 0
    live_shares = info.get("sharesOutstanding") or 0

    try:
        live_price = float(live_price) if live_price else 0
    except Exception:
        live_price = 0

    try:
        live_shares = int(live_shares) if live_shares else 0
    except Exception:
        live_shares = 0

    price = current_price if current_price is not None else live_price
    shares = shares_outstanding if shares_outstanding is not None else live_shares

    try:
        price = float(price) if price else 0
    except Exception:
        price = 0

    try:
        shares = int(shares) if shares else 0
    except Exception:
        shares = 0

    market_cap = price * shares if price and shares else 0
    anchor_cap = anchor * shares if shares else 0
    uplift = anchor_cap - market_cap
    uplift_pct = ((anchor_cap / market_cap) - 1) * 100 if market_cap else 0
    annual_return = (
        (((anchor / price) ** (1 / horizon)) - 1) * 100
        if price and horizon > 0
        else 0
    )

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

    unlock_score = round((eci["eci"] + cci["cci"]) / 2, 2)

    if unlock_score >= 70:
        priority = "Tier 1"
    elif unlock_score >= 50:
        priority = "Tier 2"
    else:
        priority = "Monitor"

    primary_constraint = (
        "Control Friction"
        if cci["cci"] > eci["eci"]
        else "Structural Inefficiency"
    )

    if unlock_score >= 70:
        urgency = "Immediate"
    elif unlock_score >= 50:
        urgency = "High"
    else:
        urgency = "Low"

    lens_read = {
        "classification": "Equity Reclamation Candidate",
        "primary_constraint": primary_constraint,
        "urgency": urgency,
        "interpretation": f"{primary_constraint} is suppressing equity convertibility",
        "unlock_path": (
            "Address governance, ownership structure, and float dynamics"
            if primary_constraint == "Control Friction"
            else "Improve operating signal convertibility and capital allocation clarity"
        ),
        "board_message": (
            f"Current structure supports a ${round(market_cap/1e6,1)}M valuation. "
            f"Unlocking constraints could support ${round(anchor_cap/1e6,1)}M."
        ),
    }

    return {
        "ticker": symbol,
        "framework": "ERER",
        "base": {
            "price": price,
            "shares": shares,
            "market_cap": market_cap,
        },
        "anchor_case": {
            "anchor": anchor,
            "anchor_cap": anchor_cap,
            "uplift": uplift,
            "uplift_pct": uplift_pct,
            "annual_return": round(annual_return, 2),
        },
        "diagnostic": {
            "eci": eci,
            "cci": cci,
            "unlock_score": unlock_score,
            "priority": priority,
        },
        "lens_read": lens_read,
    }


@router.get("/{ticker}/report")
async def run_erer_report(
    ticker: str,
    anchor: float,
    horizon: int,
    current_price: Optional[float] = None,
    shares_outstanding: Optional[int] = None,
):
    result = await run_erer(
        ticker=ticker,
        anchor=anchor,
        horizon=horizon,
        current_price=current_price,
        shares_outstanding=shares_outstanding,
    )

    return {
        "ticker": result["ticker"],
        "report_type": "ERER Memo",
        "summary": result["anchor_case"],
        "diagnosis": result["diagnostic"],
        "lens": result["lens_read"],
        "board_message": result["lens_read"]["board_message"],
    }
