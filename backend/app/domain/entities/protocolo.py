from __future__ import annotations

from dataclasses import dataclass, field

from app.domain.exceptions import ValidationError


@dataclass
class Protocolo:
    id_protocolo: str
    numero: int
    instruccion: str
    observacion: str | None = None
    imagen: str | None = None
    id_emergencia: str | None = None
    paso: "Paso | None" = field(default=None)

    def __post_init__(self) -> None:
        if not self.id_protocolo or not self.id_protocolo.strip():
            raise ValidationError("El identificador del protocolo es obligatorio")
        if self.numero < 1:
            raise ValidationError("El número de protocolo debe ser mayor o igual a 1")
        if not self.instruccion or not self.instruccion.strip():
            raise ValidationError("La instrucción del protocolo es obligatoria")

    @property
    def es_condicion(self) -> bool:
        return self.id_protocolo.startswith("C")
