from abc import ABC, abstractmethod

from app.domain.entities.emergencia import Emergencia


class EmergenciaRepository(ABC):
    @abstractmethod
    async def obtener_por_nombre(self, nombre_emergencia: str) -> Emergencia | None:
        """Devuelve la emergencia con sus pasos ordenados, o None si no existe."""

    @abstractmethod
    async def listar(self) -> list[Emergencia]:
        """Devuelve todas las emergencias (sin protocolos), ordenadas por id."""
