from app.application.dtos.regla_alerta_dto import ReglaAlertaPatchDTO, ReglaAlertaResponseDTO
from app.domain.entities.regla_alerta import ReglaAlerta
from app.domain.exceptions import NotFoundError
from app.domain.repositories.alerta_regla_repository import AlertaReglaRepository


class ActualizarParcialReglaAlertaUseCase:
    def __init__(self, repo: AlertaReglaRepository) -> None:
        self._repo = repo

    async def ejecutar(self, id_regla: int, dto: ReglaAlertaPatchDTO) -> ReglaAlertaResponseDTO:
        existente = await self._repo.obtener_por_id(id_regla)
        if existente is None:
            raise NotFoundError("La regla de alerta no existe")

        regla = ReglaAlerta(
            id_regla=id_regla,
            id_condicion=dto.id_condicion if dto.id_condicion is not None else existente.id_condicion,
            id_emergencia=dto.id_emergencia if dto.id_emergencia is not None else existente.id_emergencia,
            mensaje=dto.mensaje if dto.mensaje is not None else existente.mensaje,
            severidad=dto.severidad if dto.severidad is not None else existente.severidad,
        )
        actualizada = await self._repo.actualizar(regla)
        return ReglaAlertaResponseDTO.desde_entidad(actualizada)
