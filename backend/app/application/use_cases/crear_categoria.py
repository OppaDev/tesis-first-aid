from app.application.dtos.catalogo_admin_dto import CategoriaAdminDTO, CategoriaRequestDTO
from app.domain.entities.categoria import Categoria
from app.domain.repositories.condicion_repository import CondicionRepository


class CrearCategoriaUseCase:
    def __init__(self, repo: CondicionRepository) -> None:
        self._repo = repo

    async def ejecutar(self, dto: CategoriaRequestDTO) -> CategoriaAdminDTO:
        categoria = Categoria(nombre_categoria=dto.nombre_categoria)
        creada = await self._repo.crear_categoria(categoria)
        return CategoriaAdminDTO.desde_entidad(creada)
