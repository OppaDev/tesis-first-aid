from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.infrastructure.config import settings


def crear_token(data: dict) -> str:
    payload = data.copy()
    expira = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload["exp"] = expira
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def verificar_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None
