from app.application.dtos.condicion_dto import CategoriaConCondicionesDTO
from app.domain.repositories.condicion_repository import CondicionRepository


class ListarCatalogoCondicionesUseCase:
    def __init__(self, repo: CondicionRepository) -> None:
        self._repo = repo

    async def ejecutar(self) -> list[CategoriaConCondicionesDTO]:
        categorias = await self._repo.listar_catalogo()
        return [CategoriaConCondicionesDTO.desde_entidad(c) for c in categorias]
