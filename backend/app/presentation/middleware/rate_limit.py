from fastapi import FastAPI, status
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.infrastructure.config import settings

# Limiter compartido (clave = IP del cliente). default_limits aplica a todos los endpoints;
# rutas concretas pueden imponer un límite más estricto con @limiter.limit(...).
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[settings.rate_limit_default],
)


async def _manejar_rate_limit(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    # Respuesta consistente con el resto de la API (campo `detail`) → HTTP 429.
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={"detail": "Demasiadas solicitudes. Intenta de nuevo en un momento."},
    )


def configurar_rate_limit(app: FastAPI) -> None:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _manejar_rate_limit)
    app.add_middleware(SlowAPIMiddleware)
