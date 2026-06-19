from app.application.dtos.perfil_clinico_dto import PerfilClinicoPatchDTO, PerfilClinicoResponseDTO
from app.domain.entities.perfil_clinico import PerfilClinico
from app.domain.exceptions import NotFoundError
from app.domain.repositories.perfil_clinico_repository import PerfilClinicoRepository


class ActualizarParcialPerfilClinicoUseCase:
    def __init__(self, repo: PerfilClinicoRepository) -> None:
        self._repo = repo

    async def ejecutar(self, cedula: str, dto: PerfilClinicoPatchDTO) -> PerfilClinicoResponseDTO:
        existente = await self._repo.obtener_por_cedula(cedula)
        if existente is None:
            raise NotFoundError("El usuario no tiene un perfil clínico registrado")

        perfil = PerfilClinico(
            id_perfil=existente.id_perfil,
            cedula=cedula,
            genero=dto.genero if dto.genero is not None else existente.genero,
            tipo_sangre=dto.tipo_sangre if dto.tipo_sangre is not None else existente.tipo_sangre,
            altura_cm=dto.altura_cm if dto.altura_cm is not None else existente.altura_cm,
            peso_kg=dto.peso_kg if dto.peso_kg is not None else existente.peso_kg,
        )
        ids_condiciones = (
            dto.ids_condiciones
            if dto.ids_condiciones is not None
            else [c.id_condicion for c in existente.condiciones]
        )
        actualizado = await self._repo.actualizar(perfil, ids_condiciones)
        return PerfilClinicoResponseDTO.desde_entidad(actualizado)
