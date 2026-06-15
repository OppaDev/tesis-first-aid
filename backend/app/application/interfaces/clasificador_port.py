from abc import ABC, abstractmethod


class ClasificadorEmergenciaPort(ABC):
    @abstractmethod
    async def clasificar(self, texto: str) -> str:
        """Clasifica una narrativa y devuelve el nombre_emergencia."""
