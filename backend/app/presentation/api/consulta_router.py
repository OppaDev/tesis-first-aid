from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.consulta_dto import ConsultaRequestDTO, ConsultaResponseDTO
from app.application.dtos.texto_sanitizer import limpiar_texto
from app.application.interfaces.clasificador_port import ClasificadorEmergenciaPort
from app.application.interfaces.respondedor_qa_port import RespondedorQAPort
from app.application.interfaces.transcriptor_port import TranscriptorAudioPort
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
from app.infrastructure.config import settings
from app.infrastructure.external_services.transcriptor_whisper import TranscriptorWhisperAdapter
from app.presentation.dependencies.auth import get_usuario_opcional

router = APIRouter(prefix="/consulta", tags=["Consulta"])

_MAX_AUDIO_BYTES = settings.max_audio_mb * 1024 * 1024
_CHUNK = 64 * 1024


async def _leer_audio_con_limite(archivo: UploadFile) -> bytes:
    """Lee el archivo en bloques y aborta si supera el límite, en lugar de
    cargarlo entero en memoria (evita DoS por subidas gigantes)."""
    datos = bytearray()
    while chunk := await archivo.read(_CHUNK):
        datos.extend(chunk)
        if len(datos) > _MAX_AUDIO_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"El audio supera el límite de {settings.max_audio_mb} MB.",
            )
    return bytes(datos)

# Singletons: los modelos se cargan una sola vez en memoria
_clasificador = ClasificadorEmergenciasAdapter()
_qa = SistemaQAAdapter()
_enrutador = EnrutadorService()
_recomendacion = RecomendacionService()
_transcriptor = TranscriptorWhisperAdapter()


def get_clasificador() -> ClasificadorEmergenciaPort:
    return _clasificador


def get_qa() -> RespondedorQAPort:
    return _qa


def get_transcriptor() -> TranscriptorAudioPort:
    return _transcriptor


def _construir_use_case(
    db: AsyncSession,
    clasificador: ClasificadorEmergenciaPort,
    qa: RespondedorQAPort,
) -> ProcesarConsultaUseCase:
    emergencia_repo: EmergenciaRepository = EmergenciaRepositoryImpl(db)
    perfil_repo: PerfilClinicoRepository = PerfilClinicoRepositoryImpl(db)
    alerta_regla_repo: AlertaReglaRepository = AlertaReglaRepositoryImpl(db)
    return ProcesarConsultaUseCase(
        _enrutador,
        clasificador,
        qa,
        emergencia_repo,
        perfil_repo,
        alerta_regla_repo,
        _recomendacion,
    )


@router.post("", response_model=ConsultaResponseDTO)
async def procesar_consulta(
    request: ConsultaRequestDTO,
    db: AsyncSession = Depends(get_db),
    clasificador: ClasificadorEmergenciaPort = Depends(get_clasificador),
    qa: RespondedorQAPort = Depends(get_qa),
    usuario: Usuario | None = Depends(get_usuario_opcional),
) -> ConsultaResponseDTO:
    use_case = _construir_use_case(db, clasificador, qa)
    cedula = usuario.cedula if usuario else None
    return await use_case.ejecutar(request.texto, cedula)


@router.post("/audio", response_model=ConsultaResponseDTO)
async def procesar_consulta_audio(
    archivo: UploadFile = File(..., description="Audio de la consulta (m4a, ogg, wav...)"),
    db: AsyncSession = Depends(get_db),
    clasificador: ClasificadorEmergenciaPort = Depends(get_clasificador),
    qa: RespondedorQAPort = Depends(get_qa),
    transcriptor: TranscriptorAudioPort = Depends(get_transcriptor),
    usuario: Usuario | None = Depends(get_usuario_opcional),
) -> ConsultaResponseDTO:
    # Validación de tipo: aceptar audio/* (y el genérico que envían algunos
    # clientes); rechazar cualquier otro contenido antes de leerlo.
    tipo = archivo.content_type or ""
    if tipo and not (tipo.startswith("audio/") or tipo == "application/octet-stream"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Tipo de archivo no admitido. Sube un audio.",
        )

    audio = await _leer_audio_con_limite(archivo)
    if not audio:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El archivo de audio está vacío")

    texto = (await transcriptor.transcribir(audio)).strip()
    if not texto:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No se detectó voz en el audio. Intenta de nuevo en un lugar más silencioso.",
        )
    # Mismo saneo y tope que la consulta escrita (ConsultaRequestDTO). Se trunca
    # en lugar de rechazar: en una emergencia no se aborta por hablar de más.
    texto = limpiar_texto(texto)[:400]

    use_case = _construir_use_case(db, clasificador, qa)
    cedula = usuario.cedula if usuario else None
    respuesta = await use_case.ejecutar(texto, cedula)
    respuesta.transcripcion = texto
    return respuesta
