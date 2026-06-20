from app.application.dtos.regla_alerta_dto import ReglaAlertaResponseDTO
from app.domain.repositories.alerta_regla_repository import AlertaReglaRepository


class ListarReglasAlertaUseCase:
    def __init__(self, repo: AlertaReglaRepository) -> None:
        self._repo = repo

    async def ejecutar(self) -> list[ReglaAlertaResponseDTO]:
        reglas = await self._repo.listar()
        return [ReglaAlertaResponseDTO.desde_entidad(r) for r in reglas]
