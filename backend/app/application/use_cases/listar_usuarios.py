from app.application.dtos.paginacion import Pagina
from app.application.dtos.usuario_admin_dto import UsuarioAdminResponseDTO
from app.domain.repositories.usuario_repository import UsuarioRepository


class ListarUsuariosUseCase:
    def __init__(self, repo: UsuarioRepository) -> None:
        self._repo = repo

    async def ejecutar(self, limit: int, offset: int) -> Pagina[UsuarioAdminResponseDTO]:
        usuarios = await self._repo.listar(limit, offset)
        total = await self._repo.contar()
        return Pagina(
            items=[UsuarioAdminResponseDTO.desde_entidad(u) for u in usuarios],
            total=total,
            limit=limit,
            offset=offset,
        )
