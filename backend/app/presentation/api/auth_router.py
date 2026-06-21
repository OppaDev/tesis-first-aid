from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.auth_dto import (
    LoginRequestDTO,
    RegistroRequestDTO,
    TokenResponseDTO,
    UsuarioResponseDTO,
)
from app.application.use_cases.login_usuario import LoginUsuarioUseCase
from app.application.use_cases.registrar_usuario import RegistrarUsuarioUseCase
from app.domain.exceptions import ValidationError
from app.infrastructure.config import settings
from app.infrastructure.database.database import get_db
from app.infrastructure.database.repositories.usuario_repository_impl import UsuarioRepositoryImpl
from app.presentation.middleware.rate_limit import limiter

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/registro", response_model=UsuarioResponseDTO, status_code=status.HTTP_201_CREATED)
async def registro(dto: RegistroRequestDTO, db: AsyncSession = Depends(get_db)):
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
