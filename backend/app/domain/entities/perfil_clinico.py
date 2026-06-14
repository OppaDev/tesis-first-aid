from dataclasses import dataclass, field

from app.domain.entities.condicion import Condicion
from app.domain.exceptions import ValidationError

TIPOS_SANGRE_VALIDOS = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}


@dataclass
class PerfilClinico:
    genero: str
    tipo_sangre: str
    altura_cm: float
    peso_kg: float
    id_perfil: int | None = None
    cedula: str | None = None
    condiciones: list[Condicion] = field(default_factory=list)

    def __post_init__(self) -> None:
        if self.tipo_sangre and self.tipo_sangre not in TIPOS_SANGRE_VALIDOS:
            raise ValidationError(
                f"Tipo de sangre inválido: {self.tipo_sangre}. "
                f"Valores permitidos: {', '.join(sorted(TIPOS_SANGRE_VALIDOS))}"
            )
        if self.altura_cm is not None and self.altura_cm <= 0:
            raise ValidationError("La altura debe ser mayor a cero")
        if self.peso_kg is not None and self.peso_kg <= 0:
            raise ValidationError("El peso debe ser mayor a cero")

    @property
    def imc(self) -> float | None:
        """Índice de masa corporal (kg/m²)."""
        if not self.altura_cm or not self.peso_kg:
            return None
        altura_m = self.altura_cm / 100
        return round(self.peso_kg / (altura_m**2), 2)

    def agregar_condicion(self, condicion: Condicion) -> None:
        if not any(
            c.id_condicion == condicion.id_condicion for c in self.condiciones
        ):
            self.condiciones.append(condicion)
