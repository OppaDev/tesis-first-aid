from app.application.dtos.perfil_clinico_dto import PerfilClinicoResponseDTO
from app.domain.exceptions import NotFoundError
from app.domain.repositories.perfil_clinico_repository import PerfilClinicoRepository


class ObtenerPerfilClinicoUseCase:
    def __init__(self, repo: PerfilClinicoRepository) -> None:
        self._repo = repo

    async def ejecutar(self, cedula: str) -> PerfilClinicoResponseDTO:
        perfil = await self._repo.obtener_por_cedula(cedula)
        if perfil is None:
            raise NotFoundError("El usuario no tiene un perfil clínico registrado")
        return PerfilClinicoResponseDTO.desde_entidad(perfil)
