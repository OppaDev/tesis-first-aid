from abc import ABC, abstractmethod

from app.domain.entities.usuario import Usuario


class UsuarioRepository(ABC):

    @abstractmethod
    async def obtener_por_email(self, email: str) -> Usuario | None: ...

    @abstractmethod
    async def obtener_por_cedula(self, cedula: str) -> Usuario | None: ...

    @abstractmethod
    async def crear(self, usuario: Usuario) -> Usuario: ...
