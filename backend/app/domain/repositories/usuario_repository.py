from abc import ABC, abstractmethod

from app.domain.entities.usuario import Usuario


class UsuarioRepository(ABC):

    @abstractmethod
    async def obtener_por_email(self, email: str) -> Usuario | None: ...

    @abstractmethod
    async def obtener_por_cedula(self, cedula: str) -> Usuario | None: ...

    @abstractmethod
    async def crear(self, usuario: Usuario) -> Usuario: ...

    @abstractmethod
    async def listar(self) -> list[Usuario]: ...

    @abstractmethod
    async def actualizar_rol(self, cedula: str, id_rol: int) -> Usuario | None: ...

    @abstractmethod
    async def contar_por_rol(self, id_rol: int) -> int: ...
