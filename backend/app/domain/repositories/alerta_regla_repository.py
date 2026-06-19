from abc import ABC, abstractmethod

from app.domain.entities.regla_alerta import ReglaAlerta


class AlertaReglaRepository(ABC):
    @abstractmethod
    async def obtener_por_emergencia(self, id_emergencia: str) -> list[ReglaAlerta]:
        """Devuelve todas las reglas de alerta asociadas a una emergencia."""
