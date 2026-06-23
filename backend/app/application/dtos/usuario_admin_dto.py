from __future__ import annotations

from datetime import date

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.application.dtos.password_validator import validar_password
from app.domain.entities.usuario import Usuario


class CambiarRolRequestDTO(BaseModel):
    id_rol: int


class CrearUsuarioAdminDTO(BaseModel):
    cedula: str = Field(..., min_length=10, max_length=11)
    nombres: str = Field(..., min_length=2)
    apellidos: str = Field(..., min_length=2)
    fecha_nacimiento: date
    email: EmailStr
    password: str = Field(..., min_length=8)
    id_rol: int = 2  # por defecto, usuario

    @field_validator("password")
    @classmethod
    def _validar_password(cls, v: str) -> str:
        return validar_password(v)


class ActualizarUsuarioAdminDTO(BaseModel):
    nombres: str = Field(..., min_length=2)
    apellidos: str = Field(..., min_length=2)
    email: EmailStr


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
