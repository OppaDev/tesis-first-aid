from app.application.dtos.perfil_clinico_dto import PerfilClinicoRequestDTO, PerfilClinicoResponseDTO
from app.domain.entities.perfil_clinico import PerfilClinico
from app.domain.exceptions import NotFoundError
from app.domain.repositories.perfil_clinico_repository import PerfilClinicoRepository


class ActualizarPerfilClinicoUseCase:
    def __init__(self, repo: PerfilClinicoRepository) -> None:
        self._repo = repo

    async def ejecutar(self, cedula: str, dto: PerfilClinicoRequestDTO) -> PerfilClinicoResponseDTO:
        existente = await self._repo.obtener_por_cedula(cedula)
        if existente is None:
            raise NotFoundError("El usuario no tiene un perfil clínico registrado")

        perfil = PerfilClinico(
            id_perfil=existente.id_perfil,
            cedula=cedula,
            genero=dto.genero,
            tipo_sangre=dto.tipo_sangre,
            altura_cm=dto.altura_cm,
            peso_kg=dto.peso_kg,
        )
        condiciones = [(c.id_condicion, c.detalle) for c in dto.condiciones]
        actualizado = await self._repo.actualizar(perfil, condiciones)
        return PerfilClinicoResponseDTO.desde_entidad(actualizado)
