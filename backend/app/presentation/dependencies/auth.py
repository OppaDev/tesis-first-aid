from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.usuario import Usuario
from app.infrastructure.database.database import get_db
from app.infrastructure.database.repositories.usuario_repository_impl import UsuarioRepositoryImpl
from app.infrastructure.security.jwt import verificar_token

_bearer = HTTPBearer()
_bearer_opcional = HTTPBearer(auto_error=False)


def _version_token_valida(payload: dict, usuario: Usuario) -> bool:
    """El token es válido si su token_version coincide con el del usuario.
    Los tokens legados (sin el claim) se aceptan: no rompen sesiones previas
    y expiran solos. Los nuevos quedan revocados al cerrar sesión."""
    version = payload.get("token_version")
    return version is None or version == usuario.token_version


async def get_usuario_actual(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
):
    payload = verificar_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado")

    repo = UsuarioRepositoryImpl(db)
    usuario = await repo.obtener_por_cedula(payload.get("sub", ""))
    if not usuario:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
    if not _version_token_valida(payload, usuario):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión finalizada")

    return usuario


async def get_usuario_opcional(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_opcional),
    db: AsyncSession = Depends(get_db),
):
    """Como get_usuario_actual pero no falla si no hay token: devuelve None.

    Permite endpoints que funcionan sin login pero se enriquecen si lo hay."""
    if credentials is None:
        return None
    payload = verificar_token(credentials.credentials)
    if not payload:
        return None
    repo = UsuarioRepositoryImpl(db)
    usuario = await repo.obtener_por_cedula(payload.get("sub", ""))
    if usuario and not _version_token_valida(payload, usuario):
        return None  # token revocado: se trata como anónimo
    return usuario


def requiere_permiso(nombre_permiso: str) -> Callable:
    """Dependencia (guard) que exige un permiso concreto al usuario autenticado.

    Uso: dependencies=[Depends(requiere_permiso("gestionar_reglas"))]."""

    async def verificar(usuario: Usuario = Depends(get_usuario_actual)) -> Usuario:
        if not usuario.tiene_permiso(nombre_permiso):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permiso para realizar esta acción",
            )
        return usuario

    return verificar
