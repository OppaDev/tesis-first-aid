from app.domain.exceptions import NotFoundError
from app.domain.repositories.condicion_repository import CondicionRepository


class EliminarCondicionUseCase:
    def __init__(self, repo: CondicionRepository) -> None:
        self._repo = repo

    async def ejecutar(self, id_condicion: int) -> None:
        if await self._repo.obtener_condicion(id_condicion) is None:
            raise NotFoundError("La condición no existe")
        await self._repo.eliminar_condicion(id_condicion)
