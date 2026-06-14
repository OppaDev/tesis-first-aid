from dataclasses import dataclass

from app.domain.exceptions import ValidationError


@dataclass
class Permiso:
    nombre_permiso: str
    descripcion_permiso: str
    id_permiso: int | None = None

    def __post_init__(self) -> None:
        if not self.nombre_permiso or not self.nombre_permiso.strip():
            raise ValidationError("El nombre del permiso es obligatorio")
