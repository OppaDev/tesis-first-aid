from fastapi import FastAPI

from app.presentation.middleware.cors import configurar_cors
from app.presentation.middleware.rate_limit import configurar_rate_limit


def configurar_middlewares(app: FastAPI) -> None:
    """Registra todos los middlewares de la aplicación."""
    configurar_cors(app)
    configurar_rate_limit(app)
