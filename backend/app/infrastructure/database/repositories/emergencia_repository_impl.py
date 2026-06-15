from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.entities.emergencia import Emergencia
from app.domain.entities.paso import Paso
from app.domain.repositories.emergencia_repository import EmergenciaRepository
from app.infrastructure.database.models.emergencia_model import EmergenciaModel


class EmergenciaRepositoryImpl(EmergenciaRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def obtener_por_nombre(self, nombre_emergencia: str) -> Emergencia | None:
        result = await self._session.execute(
            select(EmergenciaModel)
            .where(EmergenciaModel.nombre_emergencia == nombre_emergencia)
            .options(selectinload(EmergenciaModel.pasos))
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
        for p in model.pasos:
            emergencia.pasos.append(
                Paso(
                    id_paso=p.id_paso,
                    numero=p.numero,
                    instruccion=p.instruccion,
                    observacion=p.observacion,
                    imagen=p.imagen,
                    paso_anterior=p.paso_anterior,
                    paso_siguiente=p.paso_siguiente,
                    anexo=p.anexo,
                    id_emergencia=p.id_emergencia,
                )
            )
        return emergencia
