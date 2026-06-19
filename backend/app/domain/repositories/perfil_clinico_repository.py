from abc import ABC, abstractmethod

from app.domain.entities.perfil_clinico import PerfilClinico


class PerfilClinicoRepository(ABC):
    @abstractmethod
    async def obtener_por_cedula(self, cedula: str) -> PerfilClinico | None: ...

    @abstractmethod
    async def crear(
        self, cedula: str, perfil: PerfilClinico, condiciones: list[tuple[int, str | None]]
    ) -> PerfilClinico: ...

    @abstractmethod
    async def actualizar(
        self, perfil: PerfilClinico, condiciones: list[tuple[int, str | None]]
    ) -> PerfilClinico: ...

    @abstractmethod
    async def eliminar(self, cedula: str) -> None: ...
