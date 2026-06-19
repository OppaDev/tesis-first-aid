from __future__ import annotations

from pydantic import BaseModel, Field

from app.domain.entities.perfil_clinico import PerfilClinico


class CondicionInputDTO(BaseModel):
    id_condicion: int
    detalle: str | None = None


class PerfilClinicoRequestDTO(BaseModel):
    genero: str
    tipo_sangre: str
    altura_cm: float = Field(..., gt=0)
    peso_kg: float = Field(..., gt=0)
    condiciones: list[CondicionInputDTO] = []


class PerfilClinicoPatchDTO(BaseModel):
    genero: str | None = None
    tipo_sangre: str | None = None
    altura_cm: float | None = Field(default=None, gt=0)
    peso_kg: float | None = Field(default=None, gt=0)
    condiciones: list[CondicionInputDTO] | None = None


class CondicionResponseDTO(BaseModel):
    id_condicion: int
    nombre_condicion: str
    descripcion_condicion: str
    id_categoria: int | None = None
    detalle: str | None = None


class PerfilClinicoResponseDTO(BaseModel):
    id_perfil: int
    genero: str
    tipo_sangre: str
    altura_cm: float
    peso_kg: float
    imc: float | None = None
    condiciones: list[CondicionResponseDTO] = []

    @classmethod
    def desde_entidad(cls, perfil: PerfilClinico) -> "PerfilClinicoResponseDTO":
        return cls(
            id_perfil=perfil.id_perfil,
            genero=perfil.genero,
            tipo_sangre=perfil.tipo_sangre,
            altura_cm=perfil.altura_cm,
            peso_kg=perfil.peso_kg,
            imc=perfil.imc,
            condiciones=[
                CondicionResponseDTO(
                    id_condicion=c.id_condicion,
                    nombre_condicion=c.nombre_condicion,
                    descripcion_condicion=c.descripcion_condicion,
                    id_categoria=c.id_categoria,
                    detalle=c.detalle,
                )
                for c in perfil.condiciones
            ],
        )
