from app.application.dtos.usuario_admin_dto import CrearUsuarioAdminDTO, UsuarioAdminResponseDTO
from app.domain.entities.usuario import Usuario
from app.domain.exceptions import ValidationError
from app.domain.repositories.usuario_repository import UsuarioRepository
from app.infrastructure.security.password import hashear


class CrearUsuarioAdminUseCase:
    def __init__(self, repo: UsuarioRepository) -> None:
        self._repo = repo

    async def ejecutar(self, dto: CrearUsuarioAdminDTO) -> UsuarioAdminResponseDTO:
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
            id_rol=dto.id_rol,
        )
        await self._repo.crear(usuario)
        creado = await self._repo.obtener_por_cedula(dto.cedula)
        return UsuarioAdminResponseDTO.desde_entidad(creado)
