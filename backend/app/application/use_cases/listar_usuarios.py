from app.application.dtos.usuario_admin_dto import UsuarioAdminResponseDTO
from app.domain.repositories.usuario_repository import UsuarioRepository


class ListarUsuariosUseCase:
    def __init__(self, repo: UsuarioRepository) -> None:
        self._repo = repo

    async def ejecutar(self) -> list[UsuarioAdminResponseDTO]:
        usuarios = await self._repo.listar()
        return [UsuarioAdminResponseDTO.desde_entidad(u) for u in usuarios]
