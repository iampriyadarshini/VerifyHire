import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.offers import router as offers_router
from app.api.routes.evidence import router as evidence_router

load_dotenv()


def _allowed_origins() -> list[str]:
    configured_origins = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )
    return [origin.strip() for origin in configured_origins.split(",") if origin.strip()]


app = FastAPI(
    title="VerifyHire API",
    description="Offer submission and evidence-based assessment API backed by PostgreSQL.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(offers_router, prefix="/api/v1")
app.include_router(evidence_router, prefix="/api/v1")
