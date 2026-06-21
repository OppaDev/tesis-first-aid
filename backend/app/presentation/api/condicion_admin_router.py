from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.catalogo_admin_dto import CondicionAdminDTO, CondicionRequestDTO
from app.application.use_cases.actualizar_condicion import ActualizarCondicionUseCase
from app.application.use_cases.crear_condicion import CrearCondicionUseCase
from app.application.use_cases.eliminar_condicion import EliminarCondicionUseCase
from app.domain.exceptions import NotFoundError
from app.infrastructure.database.database import get_db
from app.infrastructure.database.repositories.condicion_repository_impl import CondicionRepositoryImpl
from app.presentation.dependencies.auth import requiere_permiso

router = APIRouter(
    prefix="/admin/condiciones",
    tags=["Administración - Catálogo"],
    dependencies=[Depends(requiere_permiso("gestionar_catalogo"))],
)

_CATEGORIA_INVALIDA = "La categoría indicada no existe"


@router.post("", response_model=CondicionAdminDTO, status_code=status.HTTP_201_CREATED)
async def crear(dto: CondicionRequestDTO, db: AsyncSession = Depends(get_db)):
    try:
        repo = CondicionRepositoryImpl(db)
        return await CrearCondicionUseCase(repo).ejecutar(dto)
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=_CATEGORIA_INVALIDA)


@router.put("/{id_condicion}", response_model=CondicionAdminDTO)
async def actualizar(id_condicion: int, dto: CondicionRequestDTO, db: AsyncSession = Depends(get_db)):
    try:
        repo = CondicionRepositoryImpl(db)
        return await ActualizarCondicionUseCase(repo).ejecutar(id_condicion, dto)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=_CATEGORIA_INVALIDA)


@router.delete("/{id_condicion}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar(id_condicion: int, db: AsyncSession = Depends(get_db)):
    try:
        repo = CondicionRepositoryImpl(db)
        await EliminarCondicionUseCase(repo).ejecutar(id_condicion)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
