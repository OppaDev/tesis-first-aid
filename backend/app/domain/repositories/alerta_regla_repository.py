from abc import ABC, abstractmethod

from app.domain.entities.regla_alerta import ReglaAlerta


class AlertaReglaRepository(ABC):
    @abstractmethod
    async def obtener_por_emergencia(self, id_emergencia: str) -> list[ReglaAlerta]:
        """Devuelve todas las reglas de alerta asociadas a una emergencia."""

    @abstractmethod
    async def listar(self) -> list[ReglaAlerta]:
        """Devuelve todas las reglas del motor de alertas."""

    @abstractmethod
    async def obtener_por_id(self, id_regla: int) -> ReglaAlerta | None:
        """Devuelve una regla por su id, o None si no existe."""

    @abstractmethod
    async def crear(self, regla: ReglaAlerta) -> ReglaAlerta:
        """Crea una regla y la devuelve con su id asignado."""

    @abstractmethod
    async def actualizar(self, regla: ReglaAlerta) -> ReglaAlerta:
        """Actualiza una regla existente (identificada por id_regla)."""

    @abstractmethod
    async def eliminar(self, id_regla: int) -> None:
        """Elimina una regla por su id."""
