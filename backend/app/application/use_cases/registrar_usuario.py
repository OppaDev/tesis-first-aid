from app.application.dtos.auth_dto import RegistroRequestDTO, UsuarioResponseDTO
from app.domain.entities.usuario import Usuario
from app.domain.exceptions import ValidationError
from app.domain.repositories.usuario_repository import UsuarioRepository
from app.infrastructure.security.password import hashear

ID_ROL_USUARIO = 2


class RegistrarUsuarioUseCase:

    def __init__(self, repo: UsuarioRepository) -> None:
        self._repo = repo

    async def ejecutar(self, dto: RegistroRequestDTO) -> UsuarioResponseDTO:
        if await self._repo.obtener_por_cedula(dto.cedula):
            raise ValidationError("Ya existe un usuario con esa cédula")
        if await self._repo.obtener_por_email(dto.email):
            raise ValidationError("Ya existe un usuario con ese email")

        usuario = Usuario(
            cedula=dto.cedula,
            nombres=dto.nombres,
            apellidos=dto.apellidos,
            fecha_nacimiento=dto.fecha_nacimiento,
            email=dto.email,
            password=hashear(dto.password),
            id_rol=ID_ROL_USUARIO,
        )
        creado = await self._repo.crear(usuario)

        return UsuarioResponseDTO(
            cedula=creado.cedula,
            nombres=creado.nombres,
            apellidos=creado.apellidos,
            email=creado.email,
            id_rol=creado.id_rol,
        )
