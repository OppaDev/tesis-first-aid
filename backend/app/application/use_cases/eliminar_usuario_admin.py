from app.domain.exceptions import ConflictError, NotFoundError
from app.domain.repositories.perfil_clinico_repository import PerfilClinicoRepository
from app.domain.repositories.usuario_repository import UsuarioRepository

ID_ROL_ADMINISTRADOR = 1


class EliminarUsuarioAdminUseCase:
    def __init__(
        self,
        usuario_repo: UsuarioRepository,
        perfil_repo: PerfilClinicoRepository,
    ) -> None:
        self._usuario_repo = usuario_repo
        self._perfil_repo = perfil_repo

    async def ejecutar(self, cedula: str, cedula_actual: str) -> None:
        usuario = await self._usuario_repo.obtener_por_cedula(cedula)
        if usuario is None:
            raise NotFoundError("El usuario no existe")
        if cedula == cedula_actual:
            raise ConflictError("No puedes eliminar tu propia cuenta")
        if (
            usuario.id_rol == ID_ROL_ADMINISTRADOR
            and await self._usuario_repo.contar_por_rol(ID_ROL_ADMINISTRADOR) <= 1
        ):
            raise ConflictError(
                "No se puede eliminar el último administrador del sistema"
            )

        # El perfil clínico no tiene ON DELETE CASCADE; se elimina primero.
        await self._perfil_repo.eliminar(cedula)
        await self._usuario_repo.eliminar(cedula)
