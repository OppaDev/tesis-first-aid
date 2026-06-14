from dataclasses import dataclass, field

from app.domain.entities.permiso import Permiso
from app.domain.exceptions import ValidationError


@dataclass
class Rol:
    nombre_rol: str
    descripcion: str
    id_rol: int | None = None
    permisos: list[Permiso] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not self.nombre_rol or not self.nombre_rol.strip():
            raise ValidationError("El nombre del rol es obligatorio")

    def tiene_permiso(self, nombre_permiso: str) -> bool:
        return any(p.nombre_permiso == nombre_permiso for p in self.permisos)

    def asignar_permiso(self, permiso: Permiso) -> None:
        if not self.tiene_permiso(permiso.nombre_permiso):
            self.permisos.append(permiso)
