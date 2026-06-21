from fastapi import FastAPI

from app.presentation.middleware.cors import configurar_cors


def configurar_middlewares(app: FastAPI) -> None:
    """Registra todos los middlewares de la aplicación."""
    configurar_cors(app)
