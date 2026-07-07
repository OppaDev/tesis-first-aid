from datetime import date

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.application.dtos.password_validator import validar_password
from app.application.dtos.texto_sanitizer import limpiar_texto

# bcrypt solo usa los primeros 72 bytes: un tope explícito evita además
# gastar CPU hasheando contraseñas gigantes.
_MAX_PASSWORD = 72


class RegistroRequestDTO(BaseModel):
    cedula: str = Field(..., min_length=10, max_length=11)
    nombres: str = Field(..., min_length=2, max_length=100)
    apellidos: str = Field(..., min_length=2, max_length=100)
    fecha_nacimiento: date
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=_MAX_PASSWORD)

    @field_validator("password")
    @classmethod
    def _validar_password(cls, v: str) -> str:
        return validar_password(v)

    @field_validator("nombres", "apellidos")
    @classmethod
    def _limpiar(cls, v: str) -> str:
        return limpiar_texto(v)


class LoginRequestDTO(BaseModel):
    email: EmailStr
    password: str = Field(..., max_length=_MAX_PASSWORD)
    # "Confiar en este dispositivo": emite un token de larga duración para que
    # la sesión persista en el celular personal (revocable con cerrar sesión).
    confiar_dispositivo: bool = False


class CambiarPasswordRequestDTO(BaseModel):
    password_actual: str = Field(..., max_length=_MAX_PASSWORD)
    password_nueva: str = Field(..., min_length=8, max_length=_MAX_PASSWORD)

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

    nombres: str = Field(..., min_length=2, max_length=100)
    apellidos: str = Field(..., min_length=2, max_length=100)
    email: EmailStr

    @field_validator("nombres", "apellidos")
    @classmethod
    def _limpiar(cls, v: str) -> str:
        return limpiar_texto(v)
