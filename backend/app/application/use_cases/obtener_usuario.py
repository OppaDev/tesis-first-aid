from app.application.dtos.usuario_admin_dto import UsuarioAdminResponseDTO
from app.domain.exceptions import NotFoundError
from app.domain.repositories.usuario_repository import UsuarioRepository


class ObtenerUsuarioUseCase:
    def __init__(self, repo: UsuarioRepository) -> None:
        self._repo = repo

    async def ejecutar(self, cedula: str) -> UsuarioAdminResponseDTO:
        usuario = await self._repo.obtener_por_cedula(cedula)
        if usuario is None:
            raise NotFoundError("El usuario no existe")
        return UsuarioAdminResponseDTO.desde_entidad(usuario)
