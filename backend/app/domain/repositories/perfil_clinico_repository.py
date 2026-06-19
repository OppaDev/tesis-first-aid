from abc import ABC, abstractmethod

from app.domain.entities.perfil_clinico import PerfilClinico


class PerfilClinicoRepository(ABC):
    @abstractmethod
    async def obtener_por_cedula(self, cedula: str) -> PerfilClinico | None: ...

    @abstractmethod
    async def crear(self, cedula: str, perfil: PerfilClinico, ids_condiciones: list[int]) -> PerfilClinico: ...

    @abstractmethod
    async def actualizar(self, perfil: PerfilClinico, ids_condiciones: list[int]) -> PerfilClinico: ...

    @abstractmethod
    async def eliminar(self, cedula: str) -> None: ...
