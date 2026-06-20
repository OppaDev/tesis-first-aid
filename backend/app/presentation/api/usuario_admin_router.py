from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.perfil_clinico_dto import (
    PerfilClinicoPatchDTO,
    PerfilClinicoRequestDTO,
    PerfilClinicoResponseDTO,
)
from app.application.dtos.usuario_admin_dto import CambiarRolRequestDTO, UsuarioAdminResponseDTO
from app.application.use_cases.actualizar_parcial_perfil_clinico import ActualizarParcialPerfilClinicoUseCase
from app.application.use_cases.actualizar_perfil_clinico import ActualizarPerfilClinicoUseCase
from app.application.use_cases.cambiar_rol_usuario import CambiarRolUsuarioUseCase
from app.application.use_cases.listar_usuarios import ListarUsuariosUseCase
from app.application.use_cases.obtener_perfil_clinico import ObtenerPerfilClinicoUseCase
from app.application.use_cases.obtener_usuario import ObtenerUsuarioUseCase
from app.domain.exceptions import NotFoundError, ValidationError
from app.infrastructure.database.database import get_db
from app.infrastructure.database.repositories.perfil_clinico_repository_impl import PerfilClinicoRepositoryImpl
from app.infrastructure.database.repositories.usuario_repository_impl import UsuarioRepositoryImpl
from app.presentation.dependencies.auth import requiere_permiso

router = APIRouter(
    prefix="/admin/usuarios",
    tags=["Administración - Usuarios"],
    dependencies=[Depends(requiere_permiso("gestionar_usuarios"))],
)


@router.get("", response_model=list[UsuarioAdminResponseDTO])
async def listar(db: AsyncSession = Depends(get_db)):
    repo = UsuarioRepositoryImpl(db)
    return await ListarUsuariosUseCase(repo).ejecutar()


@router.get("/{cedula}", response_model=UsuarioAdminResponseDTO)
async def obtener(cedula: str, db: AsyncSession = Depends(get_db)):
    try:
        repo = UsuarioRepositoryImpl(db)
        return await ObtenerUsuarioUseCase(repo).ejecutar(cedula)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{cedula}/rol", response_model=UsuarioAdminResponseDTO)
async def cambiar_rol(cedula: str, dto: CambiarRolRequestDTO, db: AsyncSession = Depends(get_db)):
    try:
        repo = UsuarioRepositoryImpl(db)
        return await CambiarRolUsuarioUseCase(repo).ejecutar(cedula, dto)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El rol indicado no existe")


# --- Perfil clínico de un usuario (el médico/admin edita el detalle de sus condiciones) ---

@router.get("/{cedula}/perfil", response_model=PerfilClinicoResponseDTO)
async def obtener_perfil(cedula: str, db: AsyncSession = Depends(get_db)):
    try:
        repo = PerfilClinicoRepositoryImpl(db)
        return await ObtenerPerfilClinicoUseCase(repo).ejecutar(cedula)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/{cedula}/perfil", response_model=PerfilClinicoResponseDTO)
async def actualizar_perfil(cedula: str, dto: PerfilClinicoRequestDTO, db: AsyncSession = Depends(get_db)):
    try:
        repo = PerfilClinicoRepositoryImpl(db)
        return await ActualizarPerfilClinicoUseCase(repo).ejecutar(cedula, dto)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/{cedula}/perfil", response_model=PerfilClinicoResponseDTO)
async def actualizar_parcial_perfil(cedula: str, dto: PerfilClinicoPatchDTO, db: AsyncSession = Depends(get_db)):
    try:
        repo = PerfilClinicoRepositoryImpl(db)
        return await ActualizarParcialPerfilClinicoUseCase(repo).ejecutar(cedula, dto)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
