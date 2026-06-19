from app.application.dtos.perfil_clinico_dto import PerfilClinicoRequestDTO, PerfilClinicoResponseDTO
from app.domain.entities.perfil_clinico import PerfilClinico
from app.domain.exceptions import ValidationError
from app.domain.repositories.perfil_clinico_repository import PerfilClinicoRepository


class CrearPerfilClinicoUseCase:
    def __init__(self, repo: PerfilClinicoRepository) -> None:
        self._repo = repo

    async def ejecutar(self, cedula: str, dto: PerfilClinicoRequestDTO) -> PerfilClinicoResponseDTO:
        if await self._repo.obtener_por_cedula(cedula):
            raise ValidationError("El usuario ya tiene un perfil clínico registrado")

        perfil = PerfilClinico(
            genero=dto.genero,
            tipo_sangre=dto.tipo_sangre,
            altura_cm=dto.altura_cm,
            peso_kg=dto.peso_kg,
        )
        creado = await self._repo.crear(cedula, perfil, dto.ids_condiciones)
        return PerfilClinicoResponseDTO.desde_entidad(creado)
