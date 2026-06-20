from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.infrastructure.database.database import engine
from app.infrastructure.database.models import *  # noqa: F401, F403 — registra todos los modelos en Base.metadata
from app.presentation.api.auth_router import router as auth_router
from app.presentation.api.condicion_router import router as condicion_router
from app.presentation.api.consulta_router import router as consulta_router
from app.presentation.api.perfil_router import router as perfil_router
from app.presentation.api.regla_router import router as regla_router
from app.presentation.api.usuario_admin_router import router as usuario_admin_router

STATIC_DIR = Path(__file__).parent / "static"


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

app.include_router(auth_router)
app.include_router(condicion_router)
app.include_router(consulta_router)
app.include_router(perfil_router)
app.include_router(regla_router)
app.include_router(usuario_admin_router)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/health")
async def health():
    return {"status": "ok"}
