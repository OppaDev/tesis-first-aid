from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.entities.emergencia import Emergencia
from app.domain.entities.paso import Paso
from app.domain.entities.protocolo import Protocolo
from app.domain.repositories.emergencia_repository import EmergenciaRepository
from app.infrastructure.database.models.emergencia_model import EmergenciaModel
from app.infrastructure.database.models.protocolo_model import ProtocoloModel


class EmergenciaRepositoryImpl(EmergenciaRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def obtener_por_nombre(self, nombre_emergencia: str) -> Emergencia | None:
        result = await self._session.execute(
            select(EmergenciaModel)
            .where(EmergenciaModel.nombre_emergencia == nombre_emergencia)
            .options(
                selectinload(EmergenciaModel.protocolos).selectinload(ProtocoloModel.paso)
            )
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return self._to_entity(model)

    @staticmethod
    def _to_entity(model: EmergenciaModel) -> Emergencia:
        emergencia = Emergencia(
            id_emergencia=model.id_emergencia,
            nombre_emergencia=model.nombre_emergencia,
            descripcion_emergencia=model.descripcion_emergencia,
            grupo_edad=model.grupo_edad,
            severidad=model.severidad,
            etiqueta=model.etiqueta,
            evaluacion_inicial=model.evaluacion_inicial,
        )
        for pm in model.protocolos:
            paso = None
            if pm.paso is not None:
                paso = Paso(
                    id_protocolo=pm.paso.id_protocolo,
                    paso_siguiente=pm.paso.paso_siguiente,
                    paso_siguiente_no=pm.paso.paso_siguiente_no,
                    anexo_si=pm.paso.anexo_si,
                    anexo_no=pm.paso.anexo_no,
                )
            emergencia.protocolos.append(
                Protocolo(
                    id_protocolo=pm.id_protocolo,
                    numero=pm.numero,
                    instruccion=pm.instruccion,
                    observacion=pm.observacion,
                    imagen=pm.imagen,
                    id_emergencia=pm.id_emergencia,
                    paso=paso,
                )
            )
        return emergencia
