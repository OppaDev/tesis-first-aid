from dataclasses import dataclass

from app.domain.exceptions import ValidationError


@dataclass
class Condicion:
    nombre_condicion: str
    descripcion_condicion: str
    id_condicion: int | None = None
    id_categoria: int | None = None
    detalle: str | None = None  # detalle personal del usuario; None en el catálogo

    def __post_init__(self) -> None:
        if not self.nombre_condicion or not self.nombre_condicion.strip():
            raise ValidationError("El nombre de la condición es obligatorio")
