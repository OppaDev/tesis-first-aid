from sqlalchemy import func, select
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

    async def listar(self, limit: int, offset: int) -> list[ReglaAlerta]:
        result = await self._session.execute(
            select(AlertaReglaModel)
            .order_by(AlertaReglaModel.id_regla)
            .limit(limit)
            .offset(offset)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def contar(self) -> int:
        result = await self._session.execute(
            select(func.count()).select_from(AlertaReglaModel)
        )
        return result.scalar_one()

    async def obtener_por_id(self, id_regla: int) -> ReglaAlerta | None:
        model = await self._session.get(AlertaReglaModel, id_regla)
        return self._to_entity(model) if model else None

    async def crear(self, regla: ReglaAlerta) -> ReglaAlerta:
        model = AlertaReglaModel(
            id_condicion=regla.id_condicion,
            id_emergencia=regla.id_emergencia,
            mensaje=regla.mensaje,
            severidad=regla.severidad,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def actualizar(self, regla: ReglaAlerta) -> ReglaAlerta:
        model = await self._session.get(AlertaReglaModel, regla.id_regla)
        model.id_condicion = regla.id_condicion
        model.id_emergencia = regla.id_emergencia
        model.mensaje = regla.mensaje
        model.severidad = regla.severidad
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def eliminar(self, id_regla: int) -> None:
        model = await self._session.get(AlertaReglaModel, id_regla)
        if model is not None:
            await self._session.delete(model)
            await self._session.commit()

    @staticmethod
    def _to_entity(model: AlertaReglaModel) -> ReglaAlerta:
        return ReglaAlerta(
            id_regla=model.id_regla,
            id_condicion=model.id_condicion,
            id_emergencia=model.id_emergencia,
            mensaje=model.mensaje,
            severidad=model.severidad,
        )
