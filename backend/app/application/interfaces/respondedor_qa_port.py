from abc import ABC, abstractmethod


class RespondedorQAPort(ABC):
    @abstractmethod
    async def responder(self, pregunta: str) -> str | None:
        """Devuelve la respuesta más similar o None si la confianza es insuficiente."""
