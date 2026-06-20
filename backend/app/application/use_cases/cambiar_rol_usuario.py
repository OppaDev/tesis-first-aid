from app.application.dtos.usuario_admin_dto import CambiarRolRequestDTO, UsuarioAdminResponseDTO
from app.domain.exceptions import ConflictError, NotFoundError
from app.domain.repositories.usuario_repository import UsuarioRepository

ID_ROL_ADMINISTRADOR = 1


class CambiarRolUsuarioUseCase:
    def __init__(self, repo: UsuarioRepository) -> None:
        self._repo = repo

    async def ejecutar(self, cedula: str, dto: CambiarRolRequestDTO) -> UsuarioAdminResponseDTO:
        usuario = await self._repo.obtener_por_cedula(cedula)
        if usuario is None:
            raise NotFoundError("El usuario no existe")

        await self._validar_no_quitar_ultimo_admin(usuario.id_rol, dto.id_rol)

        actualizado = await self._repo.actualizar_rol(cedula, dto.id_rol)
        return UsuarioAdminResponseDTO.desde_entidad(actualizado)

    async def _validar_no_quitar_ultimo_admin(self, rol_actual: int | None, rol_nuevo: int) -> None:
        degrada_a_admin = rol_actual == ID_ROL_ADMINISTRADOR and rol_nuevo != ID_ROL_ADMINISTRADOR
        if not degrada_a_admin:
            return
        if await self._repo.contar_por_rol(ID_ROL_ADMINISTRADOR) <= 1:
            raise ConflictError(
                "No se puede quitar el rol de administrador: el sistema debe conservar al menos un administrador"
            )
