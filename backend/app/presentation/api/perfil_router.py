from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.perfil_clinico_dto import (
    PerfilClinicoPatchDTO,
    PerfilClinicoRequestDTO,
    PerfilClinicoResponseDTO,
)
from app.application.use_cases.actualizar_parcial_perfil_clinico import ActualizarParcialPerfilClinicoUseCase
from app.application.use_cases.actualizar_perfil_clinico import ActualizarPerfilClinicoUseCase
from app.application.use_cases.crear_perfil_clinico import CrearPerfilClinicoUseCase
from app.application.use_cases.eliminar_perfil_clinico import EliminarPerfilClinicoUseCase
from app.application.use_cases.obtener_perfil_clinico import ObtenerPerfilClinicoUseCase
from app.domain.entities.usuario import Usuario
from app.domain.exceptions import NotFoundError, ValidationError
from app.infrastructure.database.database import get_db
from app.infrastructure.database.repositories.perfil_clinico_repository_impl import PerfilClinicoRepositoryImpl
from app.presentation.dependencies.auth import get_usuario_actual

router = APIRouter(prefix="/perfil", tags=["Perfil clínico"])


@router.post("", response_model=PerfilClinicoResponseDTO, status_code=status.HTTP_201_CREATED)
async def crear(
    dto: PerfilClinicoRequestDTO,
    usuario: Usuario = Depends(get_usuario_actual),
    db: AsyncSession = Depends(get_db),
):
    try:
        repo = PerfilClinicoRepositoryImpl(db)
        respuesta = await CrearPerfilClinicoUseCase(repo).ejecutar(usuario.cedula, dto)
        respuesta.edad = usuario.edad
        return respuesta
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=PerfilClinicoResponseDTO)
async def obtener(
    usuario: Usuario = Depends(get_usuario_actual),
    db: AsyncSession = Depends(get_db),
):
    try:
        repo = PerfilClinicoRepositoryImpl(db)
        respuesta = await ObtenerPerfilClinicoUseCase(repo).ejecutar(usuario.cedula)
        respuesta.edad = usuario.edad
        return respuesta
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("", response_model=PerfilClinicoResponseDTO)
async def actualizar(
    dto: PerfilClinicoRequestDTO,
    usuario: Usuario = Depends(get_usuario_actual),
    db: AsyncSession = Depends(get_db),
):
    try:
        repo = PerfilClinicoRepositoryImpl(db)
        respuesta = await ActualizarPerfilClinicoUseCase(repo).ejecutar(usuario.cedula, dto)
        respuesta.edad = usuario.edad
        return respuesta
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("", response_model=PerfilClinicoResponseDTO)
async def actualizar_parcial(
    dto: PerfilClinicoPatchDTO,
    usuario: Usuario = Depends(get_usuario_actual),
    db: AsyncSession = Depends(get_db),
):
    try:
        repo = PerfilClinicoRepositoryImpl(db)
        respuesta = await ActualizarParcialPerfilClinicoUseCase(repo).ejecutar(usuario.cedula, dto)
        respuesta.edad = usuario.edad
        return respuesta
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar(
    usuario: Usuario = Depends(get_usuario_actual),
    db: AsyncSession = Depends(get_db),
):
    try:
        repo = PerfilClinicoRepositoryImpl(db)
        await EliminarPerfilClinicoUseCase(repo).ejecutar(usuario.cedula)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
