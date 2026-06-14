from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.infrastructure.database.database import engine
from app.infrastructure.database.models import *  # noqa: F401, F403 — registra todos los modelos en Base.metadata


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()


app = FastAPI(
    title="First Aid API",
    description="Backend de asistencia personalizada en primeros auxilios",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health():
    return {"status": "ok"}
