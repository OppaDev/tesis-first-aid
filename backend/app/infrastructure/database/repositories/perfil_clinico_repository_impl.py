from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.entities.condicion import Condicion
from app.domain.entities.perfil_clinico import PerfilClinico
from app.domain.repositories.perfil_clinico_repository import PerfilClinicoRepository
from app.infrastructure.database.models.condicion_model import CondicionModel
from app.infrastructure.database.models.perfil_clinico_model import PerfilClinicoModel
from app.infrastructure.database.models.perfil_condicion_model import PerfilCondicionModel


class PerfilClinicoRepositoryImpl(PerfilClinicoRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def obtener_por_cedula(self, cedula: str) -> PerfilClinico | None:
        result = await self._session.execute(
            select(PerfilClinicoModel)
            .where(PerfilClinicoModel.cedula == cedula)
            .options(
                selectinload(PerfilClinicoModel.condiciones).selectinload(
                    PerfilCondicionModel.condicion
                )
            )
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return self._to_entity(model)

    async def crear(
        self, cedula: str, perfil: PerfilClinico, condiciones: list[tuple[int, str | None]]
    ) -> PerfilClinico:
        model = PerfilClinicoModel(
            cedula=cedula,
            genero=perfil.genero,
            tipo_sangre=perfil.tipo_sangre,
            altura_cm=perfil.altura_cm,
            peso_kg=perfil.peso_kg,
        )
        model.condiciones = await self._construir_asociaciones(condiciones)
        self._session.add(model)
        await self._session.commit()
        return await self._recargar(model.id_perfil)

    async def actualizar(
        self, perfil: PerfilClinico, condiciones: list[tuple[int, str | None]]
    ) -> PerfilClinico:
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
        model.condiciones = await self._construir_asociaciones(condiciones)
        await self._session.commit()
        return await self._recargar(model.id_perfil)

    async def eliminar(self, cedula: str) -> None:
        result = await self._session.execute(
            select(PerfilClinicoModel).where(PerfilClinicoModel.cedula == cedula)
        )
        model = result.scalar_one_or_none()
        if model is not None:
            await self._session.delete(model)
            await self._session.commit()

    async def _recargar(self, id_perfil: int) -> PerfilClinico:
        result = await self._session.execute(
            select(PerfilClinicoModel)
            .where(PerfilClinicoModel.id_perfil == id_perfil)
            .options(
                selectinload(PerfilClinicoModel.condiciones).selectinload(
                    PerfilCondicionModel.condicion
                )
            )
        )
        return self._to_entity(result.scalar_one())

    async def _construir_asociaciones(
        self, condiciones: list[tuple[int, str | None]]
    ) -> list[PerfilCondicionModel]:
        if not condiciones:
            return []
        ids = [id_condicion for id_condicion, _ in condiciones]
        result = await self._session.execute(
            select(CondicionModel.id_condicion).where(CondicionModel.id_condicion.in_(ids))
        )
        ids_validos = set(result.scalars().all())
        return [
            PerfilCondicionModel(id_condicion=id_condicion, detalle=detalle)
            for id_condicion, detalle in condiciones
            if id_condicion in ids_validos
        ]

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
                    id_condicion=a.condicion.id_condicion,
                    id_categoria=a.condicion.id_categoria,
                    nombre_condicion=a.condicion.nombre_condicion,
                    descripcion_condicion=a.condicion.descripcion_condicion,
                    detalle=a.detalle,
                )
                for a in model.condiciones
            ],
        )
