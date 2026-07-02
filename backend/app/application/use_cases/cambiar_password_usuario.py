from app.application.dtos.auth_dto import TokenResponseDTO
from app.domain.exceptions import NotFoundError, ValidationError
from app.domain.repositories.usuario_repository import UsuarioRepository
from app.infrastructure.security.jwt import crear_token
from app.infrastructure.security.password import hashear, verificar


class CambiarPasswordUsuarioUseCase:
    """El usuario cambia su propia contraseña. Verifica la actual, guarda la nueva
    (hasheada) e invalida las sesiones previas (token_version), devolviendo un token
    nuevo para que la sesión actual siga viva."""

    def __init__(self, repo: UsuarioRepository) -> None:
        self._repo = repo

    async def ejecutar(
        self, cedula: str, password_actual: str, password_nueva: str
    ) -> TokenResponseDTO:
        usuario = await self._repo.obtener_por_cedula(cedula)
        if usuario is None:
            raise NotFoundError("Usuario no encontrado")
        if not verificar(password_actual, usuario.password):
            raise ValidationError("La contraseña actual es incorrecta")
        if verificar(password_nueva, usuario.password):
            raise ValidationError("La nueva contraseña debe ser distinta a la actual")

        await self._repo.actualizar_password(cedula, hashear(password_nueva))
        await self._repo.incrementar_token_version(cedula)  # revoca las demás sesiones

        actualizado = await self._repo.obtener_por_cedula(cedula)
        assert actualizado is not None
        token = crear_token({
            "sub": actualizado.cedula,
            "email": actualizado.email,
            "rol": actualizado.id_rol,
            "token_version": actualizado.token_version,
        })
        return TokenResponseDTO(access_token=token)
