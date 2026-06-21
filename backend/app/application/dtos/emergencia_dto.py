from __future__ import annotations

from pydantic import BaseModel

from app.domain.entities.emergencia import Emergencia


class EmergenciaItemDTO(BaseModel):
    id_emergencia: str
    nombre_emergencia: str
    etiqueta: str
    severidad: str

    @classmethod
    def desde_entidad(cls, emergencia: Emergencia) -> "EmergenciaItemDTO":
        return cls(
            id_emergencia=emergencia.id_emergencia,
            nombre_emergencia=emergencia.nombre_emergencia,
            etiqueta=emergencia.etiqueta,
            severidad=emergencia.severidad,
        )
