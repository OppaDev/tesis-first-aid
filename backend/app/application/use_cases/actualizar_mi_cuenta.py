from app.application.dtos.auth_dto import ActualizarMiCuentaRequestDTO, MiCuentaResponseDTO
from app.domain.exceptions import NotFoundError, ValidationError
from app.domain.repositories.usuario_repository import UsuarioRepository


class ActualizarMiCuentaUseCase:
    """El usuario autenticado actualiza sus propios datos de cuenta
    (nombres, apellidos y email)."""

    def __init__(self, repo: UsuarioRepository) -> None:
        self._repo = repo

    async def ejecutar(self, cedula: str, dto: ActualizarMiCuentaRequestDTO) -> MiCuentaResponseDTO:
        actual = await self._repo.obtener_por_cedula(cedula)
        if actual is None:
            raise NotFoundError("El usuario no existe")
        if dto.email != actual.email and await self._repo.obtener_por_email(dto.email):
            raise ValidationError("Ya existe un usuario con ese email")
        actualizado = await self._repo.actualizar_datos(
            cedula, dto.nombres, dto.apellidos, dto.email
        )
        return MiCuentaResponseDTO.desde_entidad(actualizado)
