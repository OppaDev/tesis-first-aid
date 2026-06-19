from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.entities.categoria import Categoria
from app.domain.entities.condicion import Condicion
from app.domain.repositories.condicion_repository import CondicionRepository
from app.infrastructure.database.models.categoria_model import CategoriaModel


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
