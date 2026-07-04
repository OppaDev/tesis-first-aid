from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.infrastructure.config.settings import settings


def configurar_cors(app: FastAPI) -> None:
    """Habilita CORS para el panel de administración web.

    El navegador envía un preflight OPTIONS antes de cada petición; sin CORS
    el backend responde 405 y bloquea el login web. Los orígenes permitidos
    vienen de CORS_ORIGINS (.env); por defecto '*'. Se usa autenticación por
    Bearer (no cookies), por eso allow_credentials=False.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
