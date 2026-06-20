from app.application.dtos.regla_alerta_dto import ReglaAlertaRequestDTO, ReglaAlertaResponseDTO
from app.domain.entities.regla_alerta import ReglaAlerta
from app.domain.repositories.alerta_regla_repository import AlertaReglaRepository


class CrearReglaAlertaUseCase:
    def __init__(self, repo: AlertaReglaRepository) -> None:
        self._repo = repo

    async def ejecutar(self, dto: ReglaAlertaRequestDTO) -> ReglaAlertaResponseDTO:
        regla = ReglaAlerta(
            id_condicion=dto.id_condicion,
            id_emergencia=dto.id_emergencia,
            mensaje=dto.mensaje,
            severidad=dto.severidad,
        )
        creada = await self._repo.crear(regla)
        return ReglaAlertaResponseDTO.desde_entidad(creada)
