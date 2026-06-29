from app.application.dtos.auth_dto import LoginRequestDTO, TokenResponseDTO
from app.domain.exceptions import ValidationError
from app.domain.repositories.usuario_repository import UsuarioRepository
from app.infrastructure.security.jwt import crear_token
from app.infrastructure.security.password import hashear, verificar

# Hash "señuelo" calculado una sola vez al iniciar. Cuando el email no existe,
# igualmente se verifica contra este hash para que el tiempo de respuesta sea
# equivalente al de un email real → no se puede enumerar usuarios por timing.
_HASH_SENUELO = hashear("timing-attack-decoy")


class LoginUsuarioUseCase:

    def __init__(self, repo: UsuarioRepository) -> None:
        self._repo = repo

    async def ejecutar(self, dto: LoginRequestDTO) -> TokenResponseDTO:
        usuario = await self._repo.obtener_por_email(dto.email)
        if not usuario:
            verificar(dto.password, _HASH_SENUELO)  # gasta el mismo tiempo que un login real
            raise ValidationError("Credenciales incorrectas")
        if not verificar(dto.password, usuario.password):
            raise ValidationError("Credenciales incorrectas")

        token = crear_token({
            "sub": usuario.cedula,
            "email": usuario.email,
            "rol": usuario.id_rol,
            "token_version": usuario.token_version,
        })
        return TokenResponseDTO(access_token=token)
