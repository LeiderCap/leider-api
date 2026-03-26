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
        try:
            info = t.info or {}
        except Exception:
            info = {}
    except Exception:
        info = {}

    live_current_price = 0
    try:
        live_current_price = info.get("currentPrice") or info.get("regularMarketPrice") or 0
    except Exception:
        live_current_price = 0

    live_shares_outstanding = 0
    try:
        live_shares_outstanding = info.get("sharesOutstanding") or 0
    except Exception:
        live_shares_outstanding = 0

    try:
        live_current_price = float(live_current_price) if live_current_price else 0
    except Exception:
        live_current_price = 0

    try:
        live_shares_outstanding = int(live_shares_outstanding) if live_shares_outstanding else 0
    except Exception:
        live_shares_outstanding = 0

    final_current_price = current_price if current_price is not None else live_current_price
    final_shares_outstanding = (
        shares_outstanding if shares_outstanding is not None else live_shares_outstanding
    )

    try:
        final_current_price = float(final_current_price) if final_current_price else 0
    except Exception:
        final_current_price = 0

    try:
        final_shares_outstanding = int(final_shares_outstanding) if final_shares_outstanding else 0
    except Exception:
        final_shares_outstanding = 0

    try:
        current_market_cap = (
            final_current_price * final_shares_outstanding
            if final_current_price and final_shares_outstanding
            else 0
        )
        anchor_market_cap = anchor * final_shares_outstanding if final_shares_outstanding else 0
        uplift = anchor_market_cap - current_market_cap
        uplift_pct = ((anchor_market_cap / current_market_cap) - 1) * 100 if current_market_cap > 0 else 0
        annualized_return = (
            (((anchor / final_current_price) ** (1 / horizon)) - 1) * 100
            if final_current_price > 0 and horizon > 0
            else 0
        )
    except Exception:
        current_market_cap = 0
        anchor_market_cap = 0
        uplift = 0
        uplift_pct = 0
        annualized_return = 0

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

    unlock_score = round((eci["eci"] * 0.5) + (cci["cci"] * 0.5), 2)

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

            "lens_read": lens_read,
    return {
        "ticker": symbol,
        "framework": "ERER",
        "inputs": {
            "anchor": anchor,
            "horizon_years": horizon,
            "manual_overrides": {
                "current_price": current_price,
                "shares_outstanding": shares_outstanding,
            },
        },
        "base": {
            "live_current_price": round(live_current_price, 2) if live_current_price else 0,
            "live_shares_outstanding": live_shares_outstanding,
            "current_price_used": round(final_current_price, 2) if final_current_price else 0,
            "shares_outstanding_used": final_shares_outstanding,
            "current_market_cap": round(current_market_cap, 2) if current_market_cap else 0,
        },
        "anchor_case": {
            "anchor_price": anchor,
            "anchor_market_cap": round(anchor_market_cap, 2) if anchor_market_cap else 0,
            "implied_uplift": round(uplift, 2),
            "implied_uplift_pct": round(uplift_pct, 2),
            "required_annualized_return_pct": round(annualized_return, 2),
        },
        "diagnostic": {
            "eci": eci,
            "cci": cci,
            "unlock_score": unlock_score,
            "priority": priority,
        },
        "lens_read": {
            "classification": "Equity Reclamation Candidate",
            "status": "Scored with live data fallback + manual override support",
            "next_step": "Replace placeholder ECI/CCI assumptions with company-specific values",
        },
    }
