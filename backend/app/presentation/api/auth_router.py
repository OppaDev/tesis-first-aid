from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.auth_dto import (
    CambiarPasswordRequestDTO,
    LoginRequestDTO,
    RegistroRequestDTO,
    TokenResponseDTO,
    UsuarioResponseDTO,
)
from app.application.use_cases.cambiar_password_usuario import CambiarPasswordUsuarioUseCase
from app.application.use_cases.cerrar_sesion_usuario import CerrarSesionUsuarioUseCase
from app.application.use_cases.login_usuario import LoginUsuarioUseCase
from app.application.use_cases.registrar_usuario import RegistrarUsuarioUseCase
from app.domain.entities.usuario import Usuario
from app.domain.exceptions import ValidationError
from app.infrastructure.config import settings
from app.infrastructure.database.database import get_db
from app.infrastructure.database.repositories.usuario_repository_impl import UsuarioRepositoryImpl
from app.presentation.dependencies.auth import get_usuario_actual
from app.presentation.middleware.rate_limit import limiter

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/registro", response_model=UsuarioResponseDTO, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.rate_limit_registro)
async def registro(request: Request, dto: RegistroRequestDTO, db: AsyncSession = Depends(get_db)):
    try:
        repo = UsuarioRepositoryImpl(db)
        return await RegistrarUsuarioUseCase(repo).ejecutar(dto)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponseDTO)
@limiter.limit(settings.rate_limit_login)
async def login(request: Request, dto: LoginRequestDTO, db: AsyncSession = Depends(get_db)):
    try:
        repo = UsuarioRepositoryImpl(db)
        return await LoginUsuarioUseCase(repo).ejecutar(dto)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    usuario: Usuario = Depends(get_usuario_actual),
    db: AsyncSession = Depends(get_db),
):
    """Cierra la sesión del servidor: invalida los JWT vigentes del usuario."""
    repo = UsuarioRepositoryImpl(db)
    await CerrarSesionUsuarioUseCase(repo).ejecutar(usuario.cedula)


@router.post("/cambiar-password", response_model=TokenResponseDTO)
@limiter.limit(settings.rate_limit_login)
async def cambiar_password(
    request: Request,
    dto: CambiarPasswordRequestDTO,
    usuario: Usuario = Depends(get_usuario_actual),
    db: AsyncSession = Depends(get_db),
):
    """El usuario cambia su propia contraseña; devuelve un token nuevo (las otras
    sesiones quedan revocadas)."""
    try:
        repo = UsuarioRepositoryImpl(db)
        return await CambiarPasswordUsuarioUseCase(repo).ejecutar(
            usuario.cedula, dto.password_actual, dto.password_nueva
        )
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
