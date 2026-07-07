from datetime import date

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.application.dtos.password_validator import validar_password


class RegistroRequestDTO(BaseModel):
    cedula: str = Field(..., min_length=10, max_length=11)
    nombres: str = Field(..., min_length=2)
    apellidos: str = Field(..., min_length=2)
    fecha_nacimiento: date
    email: EmailStr
    password: str = Field(..., min_length=8)

    @field_validator("password")
    @classmethod
    def _validar_password(cls, v: str) -> str:
        return validar_password(v)


class LoginRequestDTO(BaseModel):
    email: EmailStr
    password: str
    # "Confiar en este dispositivo": emite un token de larga duración para que
    # la sesión persista en el celular personal (revocable con cerrar sesión).
    confiar_dispositivo: bool = False


class CambiarPasswordRequestDTO(BaseModel):
    password_actual: str
    password_nueva: str = Field(..., min_length=8)

    @field_validator("password_nueva")
    @classmethod
    def _validar_password(cls, v: str) -> str:
        return validar_password(v)


class TokenResponseDTO(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UsuarioResponseDTO(BaseModel):
    cedula: str
    nombres: str
    apellidos: str
    email: str
    id_rol: int | None = None


class MiCuentaResponseDTO(BaseModel):
    """Datos de cuenta del usuario autenticado (los del registro)."""

    cedula: str
    nombres: str
    apellidos: str
    fecha_nacimiento: date
    email: str
    id_rol: int | None = None

    @classmethod
    def desde_entidad(cls, usuario) -> "MiCuentaResponseDTO":
        return cls(
            cedula=usuario.cedula,
            nombres=usuario.nombres,
            apellidos=usuario.apellidos,
            fecha_nacimiento=usuario.fecha_nacimiento,
            email=usuario.email,
            id_rol=usuario.id_rol,
        )


class ActualizarMiCuentaRequestDTO(BaseModel):
    """Campos de cuenta que el propio usuario puede editar; la cédula y la
    fecha de nacimiento son datos de identidad y quedan de solo lectura."""

    nombres: str = Field(..., min_length=2)
    apellidos: str = Field(..., min_length=2)
    email: EmailStr
