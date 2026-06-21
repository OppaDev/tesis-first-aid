from app.application.dtos.catalogo_admin_dto import CondicionAdminDTO, CondicionRequestDTO
from app.domain.entities.condicion import Condicion
from app.domain.exceptions import NotFoundError
from app.domain.repositories.condicion_repository import CondicionRepository


class ActualizarCondicionUseCase:
    def __init__(self, repo: CondicionRepository) -> None:
        self._repo = repo

    async def ejecutar(self, id_condicion: int, dto: CondicionRequestDTO) -> CondicionAdminDTO:
        if await self._repo.obtener_condicion(id_condicion) is None:
            raise NotFoundError("La condición no existe")

        condicion = Condicion(
            id_condicion=id_condicion,
            nombre_condicion=dto.nombre_condicion,
            descripcion_condicion=dto.descripcion_condicion,
            id_categoria=dto.id_categoria,
        )
        actualizada = await self._repo.actualizar_condicion(condicion)
        return CondicionAdminDTO.desde_entidad(actualizada)
