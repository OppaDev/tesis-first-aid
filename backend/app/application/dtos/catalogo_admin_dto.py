from __future__ import annotations

from pydantic import BaseModel, Field

from app.domain.entities.condicion import Condicion


class CondicionRequestDTO(BaseModel):
    nombre_condicion: str = Field(..., min_length=1)
    descripcion_condicion: str = Field(..., min_length=1)
    id_categoria: int | None = None


class CondicionAdminDTO(BaseModel):
    id_condicion: int
    nombre_condicion: str
    descripcion_condicion: str
    id_categoria: int | None = None

    @classmethod
    def desde_entidad(cls, condicion: Condicion) -> "CondicionAdminDTO":
        return cls(
            id_condicion=condicion.id_condicion,
            nombre_condicion=condicion.nombre_condicion,
            descripcion_condicion=condicion.descripcion_condicion,
            id_categoria=condicion.id_categoria,
        )
