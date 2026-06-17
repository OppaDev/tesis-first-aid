from app.application.dtos.auth_dto import LoginRequestDTO, TokenResponseDTO
from app.domain.exceptions import ValidationError
from app.domain.repositories.usuario_repository import UsuarioRepository
from app.infrastructure.security.jwt import crear_token
from app.infrastructure.security.password import verificar


class LoginUsuarioUseCase:

    def __init__(self, repo: UsuarioRepository) -> None:
        self._repo = repo

    async def ejecutar(self, dto: LoginRequestDTO) -> TokenResponseDTO:
        usuario = await self._repo.obtener_por_email(dto.email)
        if not usuario or not verificar(dto.password, usuario.password):
            raise ValidationError("Credenciales incorrectas")

        token = crear_token({
            "sub": usuario.cedula,
            "email": usuario.email,
            "rol": usuario.id_rol,
        })
        return TokenResponseDTO(access_token=token)
