from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
from routers import companies, scoring, pipeline, blueprints, dashboard, ingest, signals

app = FastAPI(
    title="Leider Capital Lens API",
    version="1.0.0",
    description="Backend for Manus Lens / ECI / CCI / Blueprint workflows",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/health")
async def health():
    return {"status": "ok", "system": "Leider Capital Lens API", "version": "1.0.0"}


app.include_router(companies.router, prefix="/companies", tags=["companies"])
app.include_router(scoring.router, prefix="/score", tags=["scoring"])
app.include_router(pipeline.router, prefix="/pipeline", tags=["pipeline"])
app.include_router(blueprints.router, prefix="/blueprint", tags=["blueprint"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(ingest.router, prefix="/ingest", tags=["ingest"])
app.include_router(signals.router, prefix="/signals", tags=["signals"])
