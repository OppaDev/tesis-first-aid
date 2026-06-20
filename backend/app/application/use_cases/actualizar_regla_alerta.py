from app.application.dtos.regla_alerta_dto import ReglaAlertaRequestDTO, ReglaAlertaResponseDTO
from app.domain.entities.regla_alerta import ReglaAlerta
from app.domain.exceptions import NotFoundError
from app.domain.repositories.alerta_regla_repository import AlertaReglaRepository


class ActualizarReglaAlertaUseCase:
    def __init__(self, repo: AlertaReglaRepository) -> None:
        self._repo = repo

    async def ejecutar(self, id_regla: int, dto: ReglaAlertaRequestDTO) -> ReglaAlertaResponseDTO:
        if await self._repo.obtener_por_id(id_regla) is None:
            raise NotFoundError("La regla de alerta no existe")

        regla = ReglaAlerta(
            id_regla=id_regla,
            id_condicion=dto.id_condicion,
            id_emergencia=dto.id_emergencia,
            mensaje=dto.mensaje,
            severidad=dto.severidad,
        )
        actualizada = await self._repo.actualizar(regla)
        return ReglaAlertaResponseDTO.desde_entidad(actualizada)
