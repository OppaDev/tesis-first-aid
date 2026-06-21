from app.application.dtos.emergencia_dto import EmergenciaItemDTO
from app.domain.repositories.emergencia_repository import EmergenciaRepository


class ListarEmergenciasUseCase:
    def __init__(self, repo: EmergenciaRepository) -> None:
        self._repo = repo

    async def ejecutar(self) -> list[EmergenciaItemDTO]:
        emergencias = await self._repo.listar()
        return [EmergenciaItemDTO.desde_entidad(e) for e in emergencias]
