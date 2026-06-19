from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.entities.condicion import Condicion
from app.domain.entities.perfil_clinico import PerfilClinico
from app.domain.repositories.perfil_clinico_repository import PerfilClinicoRepository
from app.infrastructure.database.models.condicion_model import CondicionModel
from app.infrastructure.database.models.perfil_clinico_model import PerfilClinicoModel


class PerfilClinicoRepositoryImpl(PerfilClinicoRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def obtener_por_cedula(self, cedula: str) -> PerfilClinico | None:
        result = await self._session.execute(
            select(PerfilClinicoModel)
            .where(PerfilClinicoModel.cedula == cedula)
            .options(selectinload(PerfilClinicoModel.condiciones))
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return self._to_entity(model)

    async def crear(self, cedula: str, perfil: PerfilClinico, ids_condiciones: list[int]) -> PerfilClinico:
        model = PerfilClinicoModel(
            cedula=cedula,
            genero=perfil.genero,
            tipo_sangre=perfil.tipo_sangre,
            altura_cm=perfil.altura_cm,
            peso_kg=perfil.peso_kg,
        )
        model.condiciones = await self._obtener_condiciones(ids_condiciones)
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model, attribute_names=["condiciones"])
        return self._to_entity(model)

    async def actualizar(self, perfil: PerfilClinico, ids_condiciones: list[int]) -> PerfilClinico:
        result = await self._session.execute(
            select(PerfilClinicoModel)
            .where(PerfilClinicoModel.id_perfil == perfil.id_perfil)
            .options(selectinload(PerfilClinicoModel.condiciones))
        )
        model = result.scalar_one()
        model.genero = perfil.genero
        model.tipo_sangre = perfil.tipo_sangre
        model.altura_cm = perfil.altura_cm
        model.peso_kg = perfil.peso_kg
        model.condiciones = await self._obtener_condiciones(ids_condiciones)
        await self._session.commit()
        await self._session.refresh(model, attribute_names=["condiciones"])
        return self._to_entity(model)

    async def eliminar(self, cedula: str) -> None:
        result = await self._session.execute(
            select(PerfilClinicoModel).where(PerfilClinicoModel.cedula == cedula)
        )
        model = result.scalar_one_or_none()
        if model is not None:
            await self._session.delete(model)
            await self._session.commit()

    async def _obtener_condiciones(self, ids_condiciones: list[int]) -> list[CondicionModel]:
        if not ids_condiciones:
            return []
        result = await self._session.execute(
            select(CondicionModel).where(CondicionModel.id_condicion.in_(ids_condiciones))
        )
        return list(result.scalars().all())

    @staticmethod
    def _to_entity(model: PerfilClinicoModel) -> PerfilClinico:
        return PerfilClinico(
            id_perfil=model.id_perfil,
            cedula=model.cedula,
            genero=model.genero,
            tipo_sangre=model.tipo_sangre,
            altura_cm=model.altura_cm,
            peso_kg=model.peso_kg,
            condiciones=[
                Condicion(
                    id_condicion=c.id_condicion,
                    id_categoria=c.id_categoria,
                    nombre_condicion=c.nombre_condicion,
                    descripcion_condicion=c.descripcion_condicion,
                )
                for c in model.condiciones
            ],
        )
