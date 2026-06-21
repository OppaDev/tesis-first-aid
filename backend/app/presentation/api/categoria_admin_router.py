from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.catalogo_admin_dto import CategoriaAdminDTO, CategoriaRequestDTO
from app.application.use_cases.actualizar_categoria import ActualizarCategoriaUseCase
from app.application.use_cases.crear_categoria import CrearCategoriaUseCase
from app.application.use_cases.eliminar_categoria import EliminarCategoriaUseCase
from app.domain.exceptions import NotFoundError
from app.infrastructure.database.database import get_db
from app.infrastructure.database.repositories.condicion_repository_impl import CondicionRepositoryImpl
from app.presentation.dependencies.auth import requiere_permiso

router = APIRouter(
    prefix="/admin/categorias",
    tags=["Administración - Catálogo"],
    dependencies=[Depends(requiere_permiso("gestionar_catalogo"))],
)

_EN_USO = "No se puede eliminar: la categoría tiene condiciones asociadas"


@router.post("", response_model=CategoriaAdminDTO, status_code=status.HTTP_201_CREATED)
async def crear(dto: CategoriaRequestDTO, db: AsyncSession = Depends(get_db)):
    repo = CondicionRepositoryImpl(db)
    return await CrearCategoriaUseCase(repo).ejecutar(dto)


@router.put("/{id_categoria}", response_model=CategoriaAdminDTO)
async def actualizar(id_categoria: int, dto: CategoriaRequestDTO, db: AsyncSession = Depends(get_db)):
    try:
        repo = CondicionRepositoryImpl(db)
        return await ActualizarCategoriaUseCase(repo).ejecutar(id_categoria, dto)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{id_categoria}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar(id_categoria: int, db: AsyncSession = Depends(get_db)):
    try:
        repo = CondicionRepositoryImpl(db)
        await EliminarCategoriaUseCase(repo).ejecutar(id_categoria)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=_EN_USO)
