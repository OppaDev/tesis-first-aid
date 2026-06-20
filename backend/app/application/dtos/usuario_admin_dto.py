from __future__ import annotations

from pydantic import BaseModel

from app.domain.entities.usuario import Usuario


class CambiarRolRequestDTO(BaseModel):
    id_rol: int


class UsuarioAdminResponseDTO(BaseModel):
    cedula: str
    nombres: str
    apellidos: str
    email: str
    id_rol: int | None = None
    nombre_rol: str | None = None

    @classmethod
    def desde_entidad(cls, usuario: Usuario) -> "UsuarioAdminResponseDTO":
        return cls(
            cedula=usuario.cedula,
            nombres=usuario.nombres,
            apellidos=usuario.apellidos,
            email=usuario.email,
            id_rol=usuario.id_rol,
            nombre_rol=usuario.rol.nombre_rol if usuario.rol else None,
        )
