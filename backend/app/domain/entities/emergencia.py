from dataclasses import dataclass, field

from app.domain.entities.paso import Paso
from app.domain.exceptions import ValidationError


@dataclass
class Emergencia:
    id_emergencia: str
    nombre_emergencia: str
    descripcion_emergencia: str
    grupo_edad: str
    severidad: str
    etiqueta: str
    evaluacion_inicial: str
    pasos: list[Paso] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not self.id_emergencia or not self.id_emergencia.strip():
            raise ValidationError("El identificador de la emergencia es obligatorio")
        if not self.nombre_emergencia or not self.nombre_emergencia.strip():
            raise ValidationError("El nombre de la emergencia es obligatorio")

    @property
    def pasos_ordenados(self) -> list[Paso]:
        return sorted(self.pasos, key=lambda p: p.numero)

    def agregar_paso(self, paso: Paso) -> None:
        if any(p.id_paso == paso.id_paso for p in self.pasos):
            raise ValidationError(
                f"La emergencia ya contiene un paso con id {paso.id_paso}"
            )
        self.pasos.append(paso)
