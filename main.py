from fastapi import FastAPI
import routers.companies as companies
import routers.scoring as scoring

app = FastAPI(
    title="Leider Capital Lens API",
    version="1.0.0"
)

@app.get("/health")
async def health():
    return {"status": "ok", "system": "Leider Capital Lens API", "version": "1.0.0"}

@app.get("/")
async def root():
    return {"message": "Leider Capital Lens API is live"}

app.include_router(companies.router, prefix="/companies", tags=["companies"])
app.include_router(scoring.router, prefix="/score", tags=["scoring"])
