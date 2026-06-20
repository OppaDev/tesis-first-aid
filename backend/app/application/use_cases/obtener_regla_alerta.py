from app.application.dtos.regla_alerta_dto import ReglaAlertaResponseDTO
from app.domain.exceptions import NotFoundError
from app.domain.repositories.alerta_regla_repository import AlertaReglaRepository


class ObtenerReglaAlertaUseCase:
    def __init__(self, repo: AlertaReglaRepository) -> None:
        self._repo = repo

    async def ejecutar(self, id_regla: int) -> ReglaAlertaResponseDTO:
        regla = await self._repo.obtener_por_id(id_regla)
        if regla is None:
            raise NotFoundError("La regla de alerta no existe")
        return ReglaAlertaResponseDTO.desde_entidad(regla)
