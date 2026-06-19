from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.consulta_dto import ConsultaRequestDTO, ConsultaResponseDTO
from app.application.interfaces.clasificador_port import ClasificadorEmergenciaPort
from app.application.interfaces.respondedor_qa_port import RespondedorQAPort
from app.application.use_cases.procesar_consulta import ProcesarConsultaUseCase
from app.domain.entities.usuario import Usuario
from app.domain.repositories.alerta_regla_repository import AlertaReglaRepository
from app.domain.repositories.emergencia_repository import EmergenciaRepository
from app.domain.repositories.perfil_clinico_repository import PerfilClinicoRepository
from app.domain.services.enrutador_service import EnrutadorService
from app.domain.services.recomendacion_service import RecomendacionService
from app.infrastructure.database.database import get_db
from app.infrastructure.database.repositories.alerta_regla_repository_impl import AlertaReglaRepositoryImpl
from app.infrastructure.database.repositories.emergencia_repository_impl import EmergenciaRepositoryImpl
from app.infrastructure.database.repositories.perfil_clinico_repository_impl import PerfilClinicoRepositoryImpl
from app.infrastructure.external_services.clasificador_emergencias import ClasificadorEmergenciasAdapter
from app.infrastructure.external_services.sistema_qa import SistemaQAAdapter
from app.presentation.dependencies.auth import get_usuario_opcional

router = APIRouter(prefix="/consulta", tags=["Consulta"])

# Singletons: los modelos se cargan una sola vez en memoria
_clasificador = ClasificadorEmergenciasAdapter()
_qa = SistemaQAAdapter()
_enrutador = EnrutadorService()
_recomendacion = RecomendacionService()


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
    usuario: Usuario | None = Depends(get_usuario_opcional),
) -> ConsultaResponseDTO:
    emergencia_repo: EmergenciaRepository = EmergenciaRepositoryImpl(db)
    perfil_repo: PerfilClinicoRepository = PerfilClinicoRepositoryImpl(db)
    alerta_regla_repo: AlertaReglaRepository = AlertaReglaRepositoryImpl(db)
    use_case = ProcesarConsultaUseCase(
        _enrutador,
        clasificador,
        qa,
        emergencia_repo,
        perfil_repo,
        alerta_regla_repo,
        _recomendacion,
    )
    cedula = usuario.cedula if usuario else None
    return await use_case.ejecutar(request.texto, cedula)
