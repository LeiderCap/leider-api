from fastapi import APIRouter

router = APIRouter()

@router.get("/{ticker}")
async def run_erer(ticker: str, anchor: float, horizon: int):
    current_price = 8.50
    shares_outstanding = 44600000

    current_market_cap = current_price * shares_outstanding
    anchor_market_cap = anchor * shares_outstanding
    uplift = anchor_market_cap - current_market_cap
    uplift_pct = ((anchor_market_cap / current_market_cap) - 1) * 100 if current_market_cap > 0 else 0
    annualized_return = (((anchor / current_price) ** (1 / horizon)) - 1) * 100 if current_price > 0 and horizon > 0 else 0

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
        "lens_read": {
            "classification": "Equity Reclamation Candidate",
            "status": "Prototype output",
            "next_step": "Replace placeholder base data with live inputs",
        },
    }
