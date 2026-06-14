from dataclasses import dataclass

from app.domain.exceptions import ValidationError


@dataclass
class Paso:
    id_paso: str
    numero: int
    instruccion: str
    observacion: str | None = None
    imagen: str | None = None
    paso_anterior: str | None = None
    paso_siguiente: str | None = None
    anexo: str | None = None
    id_emergencia: str | None = None

    def __post_init__(self) -> None:
        if not self.id_paso or not self.id_paso.strip():
            raise ValidationError("El identificador del paso es obligatorio")
        if self.numero < 1:
            raise ValidationError("El número de paso debe ser mayor o igual a 1")
        if not self.instruccion or not self.instruccion.strip():
            raise ValidationError("La instrucción del paso es obligatoria")

    @property
    def es_inicial(self) -> bool:
        return self.paso_anterior is None

    @property
    def es_final(self) -> bool:
        return self.paso_siguiente is None
