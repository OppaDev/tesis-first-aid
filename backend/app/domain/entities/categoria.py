from dataclasses import dataclass

from app.domain.exceptions import ValidationError


@dataclass
class Categoria:
    nombre_categoria: str
    id_categoria: int | None = None

    def __post_init__(self) -> None:
        if not self.nombre_categoria or not self.nombre_categoria.strip():
            raise ValidationError("El nombre de la categoría es obligatorio")
