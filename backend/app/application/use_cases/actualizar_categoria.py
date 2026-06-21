from app.application.dtos.catalogo_admin_dto import CategoriaAdminDTO, CategoriaRequestDTO
from app.domain.entities.categoria import Categoria
from app.domain.exceptions import NotFoundError
from app.domain.repositories.condicion_repository import CondicionRepository


class ActualizarCategoriaUseCase:
    def __init__(self, repo: CondicionRepository) -> None:
        self._repo = repo

    async def ejecutar(self, id_categoria: int, dto: CategoriaRequestDTO) -> CategoriaAdminDTO:
        if await self._repo.obtener_categoria(id_categoria) is None:
            raise NotFoundError("La categoría no existe")

        categoria = Categoria(
            id_categoria=id_categoria,
            nombre_categoria=dto.nombre_categoria,
        )
        actualizada = await self._repo.actualizar_categoria(categoria)
        return CategoriaAdminDTO.desde_entidad(actualizada)
