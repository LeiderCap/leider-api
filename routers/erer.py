@router.get("/{ticker}")
async def run_erer(ticker: str, anchor: float, horizon: int):
    symbol = ticker.upper()
    t = yf.Ticker(symbol)
    info = t.info

    current_price = info.get("currentPrice") or info.get("regularMarketPrice") or 0
    shares_outstanding = info.get("sharesOutstanding") or 0

    current_market_cap = current_price * shares_outstanding if current_price and shares_outstanding else 0
    anchor_market_cap = anchor * shares_outstanding if shares_outstanding else 0
    uplift = anchor_market_cap - current_market_cap
    uplift_pct = ((anchor_market_cap / current_market_cap) - 1) * 100 if current_market_cap > 0 else 0
    annualized_return = (((anchor / current_price) ** (1 / horizon)) - 1) * 100 if current_price > 0 and horizon > 0 else 0

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

    return {
        "ticker": ticker.upper(),
        "framework": "ERER",
        "inputs": {
            "anchor": anchor,
            "horizon_years": horizon,
        },
        "base": {
            "current_price": round(current_price, 2),
            "shares_outstanding": shares_outstanding,
            "current_market_cap": round(current_market_cap, 2),
        },
        "anchor_case": {
            "anchor_price": anchor,
            "anchor_market_cap": round(anchor_market_cap, 2),
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
            "status": "Scored",
            "next_step": "Replace placeholder market inputs with live ticker data",
        },
    }
