from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_companies():
    return [
        {"ticker": "AAPL", "name": "Apple"},
        {"ticker": "TSLA", "name": "Tesla"},
        {"ticker": "AMCX", "name": "AMC Networks"}
    ]

@router.get("/{ticker}")
async def get_company(ticker: str):
    return {"ticker": ticker.upper(), "status": "loaded"}
