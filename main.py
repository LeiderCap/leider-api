from fastapi import FastAPI

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
