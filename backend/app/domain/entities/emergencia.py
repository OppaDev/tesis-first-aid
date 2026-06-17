from dataclasses import dataclass, field

from app.domain.entities.protocolo import Protocolo
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
    protocolos: list[Protocolo] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not self.id_emergencia or not self.id_emergencia.strip():
            raise ValidationError("El identificador de la emergencia es obligatorio")
        if not self.nombre_emergencia or not self.nombre_emergencia.strip():
            raise ValidationError("El nombre de la emergencia es obligatorio")

    @property
    def protocolos_ordenados(self) -> list[Protocolo]:
        return sorted(self.protocolos, key=lambda p: p.numero)

    def agregar_protocolo(self, protocolo: Protocolo) -> None:
        if any(p.id_protocolo == protocolo.id_protocolo for p in self.protocolos):
            raise ValidationError(
                f"La emergencia ya contiene el protocolo {protocolo.id_protocolo}"
            )
        self.protocolos.append(protocolo)
