from app.application.dtos.paginacion import Pagina
from app.application.dtos.regla_alerta_dto import ReglaAlertaResponseDTO
from app.domain.repositories.alerta_regla_repository import AlertaReglaRepository


class ListarReglasAlertaUseCase:
    def __init__(self, repo: AlertaReglaRepository) -> None:
        self._repo = repo

    async def ejecutar(self, limit: int, offset: int) -> Pagina[ReglaAlertaResponseDTO]:
        reglas = await self._repo.listar(limit, offset)
        total = await self._repo.contar()
        return Pagina(
            items=[ReglaAlertaResponseDTO.desde_entidad(r) for r in reglas],
            total=total,
            limit=limit,
            offset=offset,
        )
