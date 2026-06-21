from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.entities.categoria import Categoria
from app.domain.entities.condicion import Condicion
from app.domain.repositories.condicion_repository import CondicionRepository
from app.infrastructure.database.models.categoria_model import CategoriaModel
from app.infrastructure.database.models.condicion_model import CondicionModel


class CondicionRepositoryImpl(CondicionRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def listar_catalogo(self) -> list[Categoria]:
        result = await self._session.execute(
            select(CategoriaModel)
            .options(selectinload(CategoriaModel.condiciones))
            .order_by(CategoriaModel.id_categoria)
        )
        return [self._to_entity(model) for model in result.scalars().all()]

    async def obtener_condicion(self, id_condicion: int) -> Condicion | None:
        model = await self._session.get(CondicionModel, id_condicion)
        return self._condicion_to_entity(model) if model else None

    async def crear_condicion(self, condicion: Condicion) -> Condicion:
        model = CondicionModel(
            nombre_condicion=condicion.nombre_condicion,
            descripcion_condicion=condicion.descripcion_condicion,
            id_categoria=condicion.id_categoria,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._condicion_to_entity(model)

    async def actualizar_condicion(self, condicion: Condicion) -> Condicion:
        model = await self._session.get(CondicionModel, condicion.id_condicion)
        model.nombre_condicion = condicion.nombre_condicion
        model.descripcion_condicion = condicion.descripcion_condicion
        model.id_categoria = condicion.id_categoria
        await self._session.commit()
        await self._session.refresh(model)
        return self._condicion_to_entity(model)

    async def eliminar_condicion(self, id_condicion: int) -> None:
        model = await self._session.get(CondicionModel, id_condicion)
        if model is not None:
            await self._session.delete(model)
            await self._session.commit()

    @staticmethod
    def _condicion_to_entity(model: CondicionModel) -> Condicion:
        return Condicion(
            id_condicion=model.id_condicion,
            id_categoria=model.id_categoria,
            nombre_condicion=model.nombre_condicion,
            descripcion_condicion=model.descripcion_condicion,
        )

    @staticmethod
    def _to_entity(model: CategoriaModel) -> Categoria:
        return Categoria(
            id_categoria=model.id_categoria,
            nombre_categoria=model.nombre_categoria,
            condiciones=[
                Condicion(
                    id_condicion=c.id_condicion,
                    id_categoria=c.id_categoria,
                    nombre_condicion=c.nombre_condicion,
                    descripcion_condicion=c.descripcion_condicion,
                )
                for c in sorted(model.condiciones, key=lambda c: c.id_condicion)
            ],
        )
