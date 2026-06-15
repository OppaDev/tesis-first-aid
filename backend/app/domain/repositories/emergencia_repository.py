from abc import ABC, abstractmethod

from app.domain.entities.emergencia import Emergencia


class EmergenciaRepository(ABC):
    @abstractmethod
    async def obtener_por_nombre(self, nombre_emergencia: str) -> Emergencia | None:
        """Devuelve la emergencia con sus pasos ordenados, o None si no existe."""
