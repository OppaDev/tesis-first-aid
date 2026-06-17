from app.application.dtos.consulta_dto import ConsultaResponseDTO, PasoDTO, ProtocoloDTO
from app.application.interfaces.clasificador_port import ClasificadorEmergenciaPort
from app.application.interfaces.respondedor_qa_port import RespondedorQAPort
from app.domain.repositories.emergencia_repository import EmergenciaRepository
from app.domain.services.enrutador_service import EnrutadorService, TipoConsulta

_MSG_SIN_INFO = (
    "No encontré información segura para esa situación. "
    "Por favor contacta a los servicios de emergencia."
)


class ProcesarConsultaUseCase:

    def __init__(
        self,
        enrutador: EnrutadorService,
        clasificador: ClasificadorEmergenciaPort,
        qa: RespondedorQAPort,
        emergencia_repo: EmergenciaRepository,
    ) -> None:
        self._enrutador = enrutador
        self._clasificador = clasificador
        self._qa = qa
        self._emergencia_repo = emergencia_repo

    async def ejecutar(self, texto: str) -> ConsultaResponseDTO:
        tipo = self._enrutador.enrutar(texto)
        if tipo == TipoConsulta.PREGUNTA:
            return await self._manejar_pregunta(texto)
        return await self._manejar_narrativa(texto)

    async def _manejar_pregunta(self, texto: str) -> ConsultaResponseDTO:
        respuesta = await self._qa.responder(texto)
        if respuesta is None:
            return ConsultaResponseDTO(
                tipo=TipoConsulta.PREGUNTA,
                respuesta=None,
                mensaje=_MSG_SIN_INFO,
            )
        return ConsultaResponseDTO(tipo=TipoConsulta.PREGUNTA, respuesta=respuesta)

    async def _manejar_narrativa(self, texto: str) -> ConsultaResponseDTO:
        nombre_emergencia = await self._clasificador.clasificar(texto)
        emergencia = await self._emergencia_repo.obtener_por_nombre(nombre_emergencia)

        if emergencia is None:
            return ConsultaResponseDTO(
                tipo=TipoConsulta.NARRATIVA,
                emergencia_detectada=nombre_emergencia,
                protocolo_encontrado=False,
                mensaje="Emergencia identificada pero el protocolo aún no está cargado en la base de datos.",
            )

        protocolos = [
            ProtocoloDTO(
                id_protocolo=p.id_protocolo,
                numero=p.numero,
                instruccion=p.instruccion,
                observacion=p.observacion,
                imagen=p.imagen,
                es_condicion=p.es_condicion,
                paso=PasoDTO(
                    paso_siguiente=p.paso.paso_siguiente,
                    paso_siguiente_no=p.paso.paso_siguiente_no,
                    anexo_si=p.paso.anexo_si,
                    anexo_no=p.paso.anexo_no,
                ) if p.paso else None,
            )
            for p in emergencia.protocolos_ordenados
        ]

        return ConsultaResponseDTO(
            tipo=TipoConsulta.NARRATIVA,
            emergencia_detectada=nombre_emergencia,
            protocolo_encontrado=True,
            protocolos=protocolos,
        )
