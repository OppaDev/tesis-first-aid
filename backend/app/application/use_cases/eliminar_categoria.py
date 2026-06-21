from app.domain.exceptions import NotFoundError
from app.domain.repositories.condicion_repository import CondicionRepository


class EliminarCategoriaUseCase:
    def __init__(self, repo: CondicionRepository) -> None:
        self._repo = repo

    async def ejecutar(self, id_categoria: int) -> None:
        if await self._repo.obtener_categoria(id_categoria) is None:
            raise NotFoundError("La categoría no existe")
        await self._repo.eliminar_categoria(id_categoria)
