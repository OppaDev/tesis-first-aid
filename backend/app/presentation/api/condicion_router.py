from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.condicion_dto import CategoriaConCondicionesDTO
from app.application.use_cases.listar_catalogo_condiciones import ListarCatalogoCondicionesUseCase
from app.infrastructure.database.database import get_db
from app.infrastructure.database.repositories.condicion_repository_impl import CondicionRepositoryImpl

router = APIRouter(prefix="/condiciones", tags=["Condiciones"])


@router.get("", response_model=list[CategoriaConCondicionesDTO])
async def listar_catalogo(db: AsyncSession = Depends(get_db)):
    repo = CondicionRepositoryImpl(db)
    return await ListarCatalogoCondicionesUseCase(repo).ejecutar()
