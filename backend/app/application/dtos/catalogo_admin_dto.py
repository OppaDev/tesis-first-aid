from __future__ import annotations

from pydantic import BaseModel, Field, field_validator

from app.application.dtos.texto_sanitizer import limpiar_texto
from app.domain.entities.categoria import Categoria
from app.domain.entities.condicion import Condicion


class CategoriaRequestDTO(BaseModel):
    nombre_categoria: str = Field(..., min_length=1, max_length=100)

    @field_validator("nombre_categoria")
    @classmethod
    def _limpiar(cls, v: str) -> str:
        return limpiar_texto(v)


class CategoriaAdminDTO(BaseModel):
    id_categoria: int
    nombre_categoria: str

    @classmethod
    def desde_entidad(cls, categoria: Categoria) -> "CategoriaAdminDTO":
        return cls(
            id_categoria=categoria.id_categoria,
            nombre_categoria=categoria.nombre_categoria,
        )


class CondicionRequestDTO(BaseModel):
    nombre_condicion: str = Field(..., min_length=1, max_length=100)
    descripcion_condicion: str = Field(..., min_length=1, max_length=300)
    id_categoria: int | None = None

    @field_validator("nombre_condicion", "descripcion_condicion")
    @classmethod
    def _limpiar(cls, v: str) -> str:
        return limpiar_texto(v)


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
