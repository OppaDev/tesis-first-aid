from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.regla_alerta import ReglaAlerta
from app.domain.repositories.alerta_regla_repository import AlertaReglaRepository
from app.infrastructure.database.models.alerta_regla_model import AlertaReglaModel


class AlertaReglaRepositoryImpl(AlertaReglaRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def obtener_por_emergencia(self, id_emergencia: str) -> list[ReglaAlerta]:
        result = await self._session.execute(
            select(AlertaReglaModel).where(AlertaReglaModel.id_emergencia == id_emergencia)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    @staticmethod
    def _to_entity(model: AlertaReglaModel) -> ReglaAlerta:
        return ReglaAlerta(
            id_regla=model.id_regla,
            id_condicion=model.id_condicion,
            id_emergencia=model.id_emergencia,
            mensaje=model.mensaje,
            severidad=model.severidad,
        )
