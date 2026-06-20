from app.application.dtos.usuario_admin_dto import CambiarRolRequestDTO, UsuarioAdminResponseDTO
from app.domain.exceptions import NotFoundError
from app.domain.repositories.usuario_repository import UsuarioRepository


class CambiarRolUsuarioUseCase:
    def __init__(self, repo: UsuarioRepository) -> None:
        self._repo = repo

    async def ejecutar(self, cedula: str, dto: CambiarRolRequestDTO) -> UsuarioAdminResponseDTO:
        actualizado = await self._repo.actualizar_rol(cedula, dto.id_rol)
        if actualizado is None:
            raise NotFoundError("El usuario no existe")
        return UsuarioAdminResponseDTO.desde_entidad(actualizado)
