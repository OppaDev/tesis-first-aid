from __future__ import annotations

from pydantic import BaseModel

from app.domain.entities.categoria import Categoria


class CondicionCatalogoDTO(BaseModel):
    id_condicion: int
    nombre_condicion: str
    descripcion_condicion: str


class CategoriaConCondicionesDTO(BaseModel):
    id_categoria: int
    nombre_categoria: str
    condiciones: list[CondicionCatalogoDTO] = []

    @classmethod
    def desde_entidad(cls, categoria: Categoria) -> "CategoriaConCondicionesDTO":
        return cls(
            id_categoria=categoria.id_categoria,
            nombre_categoria=categoria.nombre_categoria,
            condiciones=[
                CondicionCatalogoDTO(
                    id_condicion=c.id_condicion,
                    nombre_condicion=c.nombre_condicion,
                    descripcion_condicion=c.descripcion_condicion,
                )
                for c in categoria.condiciones
            ],
        )
