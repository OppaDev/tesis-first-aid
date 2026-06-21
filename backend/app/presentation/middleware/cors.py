from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def configurar_cors(app: FastAPI) -> None:
    """Habilita CORS para el panel de administración web.

    El navegador envía un preflight OPTIONS antes de cada petición; sin CORS
    el backend responde 405 y bloquea el login web. Se usa autenticación por
    Bearer (no cookies), por eso allow_credentials=False junto con origins '*'.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
