from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.paginacion import Pagina
from app.application.dtos.regla_alerta_dto import (
    ReglaAlertaPatchDTO,
    ReglaAlertaRequestDTO,
    ReglaAlertaResponseDTO,
)
from app.application.use_cases.actualizar_parcial_regla_alerta import ActualizarParcialReglaAlertaUseCase
from app.application.use_cases.actualizar_regla_alerta import ActualizarReglaAlertaUseCase
from app.application.use_cases.crear_regla_alerta import CrearReglaAlertaUseCase
from app.application.use_cases.eliminar_regla_alerta import EliminarReglaAlertaUseCase
from app.application.use_cases.listar_reglas_alerta import ListarReglasAlertaUseCase
from app.application.use_cases.obtener_regla_alerta import ObtenerReglaAlertaUseCase
from app.domain.exceptions import NotFoundError
from app.infrastructure.database.database import get_db
from app.infrastructure.database.repositories.alerta_regla_repository_impl import AlertaReglaRepositoryImpl
from app.presentation.dependencies.auth import requiere_permiso

router = APIRouter(
    prefix="/admin/reglas",
    tags=["Administración - Reglas de alerta"],
    dependencies=[Depends(requiere_permiso("gestionar_reglas"))],
)

_FK_INVALIDA = "La condición o la emergencia indicada no existe"
_DUPLICADA = "Ya existe una regla para esa condición y emergencia"


def _traducir_integrity_error(error: IntegrityError) -> HTTPException:
    detalle = _DUPLICADA if "uq_alerta" in str(error.orig) else _FK_INVALIDA
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detalle)


@router.get("", response_model=Pagina[ReglaAlertaResponseDTO])
async def listar(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    repo = AlertaReglaRepositoryImpl(db)
    return await ListarReglasAlertaUseCase(repo).ejecutar(limit, offset)


@router.get("/{id_regla}", response_model=ReglaAlertaResponseDTO)
async def obtener(id_regla: int, db: AsyncSession = Depends(get_db)):
    try:
        repo = AlertaReglaRepositoryImpl(db)
        return await ObtenerReglaAlertaUseCase(repo).ejecutar(id_regla)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=ReglaAlertaResponseDTO, status_code=status.HTTP_201_CREATED)
async def crear(dto: ReglaAlertaRequestDTO, db: AsyncSession = Depends(get_db)):
    try:
        repo = AlertaReglaRepositoryImpl(db)
        return await CrearReglaAlertaUseCase(repo).ejecutar(dto)
    except IntegrityError as e:
        raise _traducir_integrity_error(e)


@router.put("/{id_regla}", response_model=ReglaAlertaResponseDTO)
async def actualizar(id_regla: int, dto: ReglaAlertaRequestDTO, db: AsyncSession = Depends(get_db)):
    try:
        repo = AlertaReglaRepositoryImpl(db)
        return await ActualizarReglaAlertaUseCase(repo).ejecutar(id_regla, dto)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except IntegrityError as e:
        raise _traducir_integrity_error(e)


@router.patch("/{id_regla}", response_model=ReglaAlertaResponseDTO)
async def actualizar_parcial(id_regla: int, dto: ReglaAlertaPatchDTO, db: AsyncSession = Depends(get_db)):
    try:
        repo = AlertaReglaRepositoryImpl(db)
        return await ActualizarParcialReglaAlertaUseCase(repo).ejecutar(id_regla, dto)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except IntegrityError as e:
        raise _traducir_integrity_error(e)


@router.delete("/{id_regla}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar(id_regla: int, db: AsyncSession = Depends(get_db)):
    try:
        repo = AlertaReglaRepositoryImpl(db)
        await EliminarReglaAlertaUseCase(repo).ejecutar(id_regla)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
