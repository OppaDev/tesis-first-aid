from dataclasses import dataclass
from datetime import date

from app.domain.entities.rol import Rol
from app.domain.exceptions import ValidationError
from app.domain.services.cedula_service import validar_cedula_ecuatoriana


@dataclass
class Usuario:
    cedula: str
    nombres: str
    apellidos: str
    fecha_nacimiento: date
    email: str
    password: str  # hash de la contraseña, nunca texto plano
    id_rol: int | None = None
    rol: Rol | None = None
    token_version: int = 0  # se incrementa al cerrar sesión (revocación de JWT)

    def __post_init__(self) -> None:
        if not self.cedula or not self.cedula.strip():
            raise ValidationError("La cédula es obligatoria")
        if not validar_cedula_ecuatoriana(self.cedula):
            raise ValidationError("La cédula ecuatoriana no es válida")
        if not self.nombres or not self.nombres.strip():
            raise ValidationError("Los nombres son obligatorios")
        if not self.apellidos or not self.apellidos.strip():
            raise ValidationError("Los apellidos son obligatorios")
        if not self.email or "@" not in self.email:
            raise ValidationError("El email no tiene un formato válido")
        if self.fecha_nacimiento >= date.today():
            raise ValidationError("La fecha de nacimiento debe ser anterior a hoy")

    def tiene_permiso(self, nombre_permiso: str) -> bool:
        return self.rol is not None and self.rol.tiene_permiso(nombre_permiso)

    @property
    def nombre_completo(self) -> str:
        return f"{self.nombres} {self.apellidos}"

    @property
    def edad(self) -> int:
        hoy = date.today()
        nacimiento = self.fecha_nacimiento
        edad = hoy.year - nacimiento.year
        if (hoy.month, hoy.day) < (nacimiento.month, nacimiento.day):
            edad -= 1
        return edad
