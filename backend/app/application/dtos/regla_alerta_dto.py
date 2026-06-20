from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.domain.entities.regla_alerta import ReglaAlerta

Severidad = Literal["critica", "alta", "media", "baja"]


class ReglaAlertaRequestDTO(BaseModel):
    id_condicion: int
    id_emergencia: str = Field(..., min_length=1)
    mensaje: str = Field(..., min_length=1)
    severidad: Severidad


class ReglaAlertaPatchDTO(BaseModel):
    id_condicion: int | None = None
    id_emergencia: str | None = Field(default=None, min_length=1)
    mensaje: str | None = Field(default=None, min_length=1)
    severidad: Severidad | None = None


class ReglaAlertaResponseDTO(BaseModel):
    id_regla: int
    id_condicion: int
    id_emergencia: str
    mensaje: str
    severidad: str

    @classmethod
    def desde_entidad(cls, regla: ReglaAlerta) -> "ReglaAlertaResponseDTO":
        return cls(
            id_regla=regla.id_regla,
            id_condicion=regla.id_condicion,
            id_emergencia=regla.id_emergencia,
            mensaje=regla.mensaje,
            severidad=regla.severidad,
        )
