from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.emergencia_dto import EmergenciaItemDTO
from app.application.use_cases.listar_emergencias import ListarEmergenciasUseCase
from app.infrastructure.database.database import get_db
from app.infrastructure.database.repositories.emergencia_repository_impl import EmergenciaRepositoryImpl

router = APIRouter(prefix="/emergencias", tags=["Emergencias"])


@router.get("", response_model=list[EmergenciaItemDTO])
async def listar(db: AsyncSession = Depends(get_db)):
    repo = EmergenciaRepositoryImpl(db)
    return await ListarEmergenciasUseCase(repo).ejecutar()
