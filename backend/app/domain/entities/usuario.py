from dataclasses import dataclass
from datetime import date

from app.domain.exceptions import ValidationError


@dataclass
class Usuario:
    cedula: str
    nombres: str
    apellidos: str
    fecha_nacimiento: date
    email: str
    password: str  # hash de la contraseña, nunca texto plano
    id_rol: int | None = None

    def __post_init__(self) -> None:
        if not self.cedula or not self.cedula.strip():
            raise ValidationError("La cédula es obligatoria")
        if not self.cedula.isdigit():
            raise ValidationError("La cédula solo puede contener dígitos")
        if not self.nombres or not self.nombres.strip():
            raise ValidationError("Los nombres son obligatorios")
        if not self.apellidos or not self.apellidos.strip():
            raise ValidationError("Los apellidos son obligatorios")
        if not self.email or "@" not in self.email:
            raise ValidationError("El email no tiene un formato válido")
        if self.fecha_nacimiento >= date.today():
            raise ValidationError("La fecha de nacimiento debe ser anterior a hoy")

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
