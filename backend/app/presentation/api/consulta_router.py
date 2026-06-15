from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.consulta_dto import ConsultaRequestDTO, ConsultaResponseDTO
from app.application.interfaces.clasificador_port import ClasificadorEmergenciaPort
from app.application.interfaces.respondedor_qa_port import RespondedorQAPort
from app.application.use_cases.procesar_consulta import ProcesarConsultaUseCase
from app.domain.repositories.emergencia_repository import EmergenciaRepository
from app.domain.services.enrutador_service import EnrutadorService
from app.infrastructure.database.database import get_db
from app.infrastructure.database.repositories.emergencia_repository_impl import EmergenciaRepositoryImpl
from app.infrastructure.external_services.clasificador_emergencias import ClasificadorEmergenciasAdapter
from app.infrastructure.external_services.sistema_qa import SistemaQAAdapter

router = APIRouter(prefix="/consulta", tags=["Consulta"])

# Singletons: los modelos se cargan una sola vez en memoria
_clasificador = ClasificadorEmergenciasAdapter()
_qa = SistemaQAAdapter()
_enrutador = EnrutadorService()


def get_clasificador() -> ClasificadorEmergenciaPort:
    return _clasificador


def get_qa() -> RespondedorQAPort:
    return _qa


@router.post("", response_model=ConsultaResponseDTO)
async def procesar_consulta(
    request: ConsultaRequestDTO,
    db: AsyncSession = Depends(get_db),
    clasificador: ClasificadorEmergenciaPort = Depends(get_clasificador),
    qa: RespondedorQAPort = Depends(get_qa),
) -> ConsultaResponseDTO:
    repo: EmergenciaRepository = EmergenciaRepositoryImpl(db)
    use_case = ProcesarConsultaUseCase(_enrutador, clasificador, qa, repo)
    return await use_case.ejecutar(request.texto)
