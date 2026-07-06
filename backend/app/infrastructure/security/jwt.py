from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.infrastructure.config import settings


def crear_token(data: dict, minutos: int | None = None) -> str:
    payload = data.copy()
    duracion = minutos if minutos is not None else settings.access_token_expire_minutes
    expira = datetime.now(timezone.utc) + timedelta(minutes=duracion)
    payload["exp"] = expira
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def verificar_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None
