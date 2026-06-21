from app.application.dtos.catalogo_admin_dto import CondicionAdminDTO, CondicionRequestDTO
from app.domain.entities.condicion import Condicion
from app.domain.repositories.condicion_repository import CondicionRepository


class CrearCondicionUseCase:
    def __init__(self, repo: CondicionRepository) -> None:
        self._repo = repo

    async def ejecutar(self, dto: CondicionRequestDTO) -> CondicionAdminDTO:
        condicion = Condicion(
            nombre_condicion=dto.nombre_condicion,
            descripcion_condicion=dto.descripcion_condicion,
            id_categoria=dto.id_categoria,
        )
        creada = await self._repo.crear_condicion(condicion)
        return CondicionAdminDTO.desde_entidad(creada)
