from app.domain.exceptions import NotFoundError
from app.domain.repositories.alerta_regla_repository import AlertaReglaRepository


class EliminarReglaAlertaUseCase:
    def __init__(self, repo: AlertaReglaRepository) -> None:
        self._repo = repo

    async def ejecutar(self, id_regla: int) -> None:
        if await self._repo.obtener_por_id(id_regla) is None:
            raise NotFoundError("La regla de alerta no existe")
        await self._repo.eliminar(id_regla)
