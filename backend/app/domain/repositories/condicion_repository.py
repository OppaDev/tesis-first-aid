from abc import ABC, abstractmethod

from app.domain.entities.categoria import Categoria
from app.domain.entities.condicion import Condicion


class CondicionRepository(ABC):
    @abstractmethod
    async def listar_catalogo(self) -> list[Categoria]:
        """Devuelve las categorías con sus condiciones, para poblar el formulario de perfil."""

    @abstractmethod
    async def obtener_condicion(self, id_condicion: int) -> Condicion | None:
        """Devuelve una condición por su id, o None si no existe."""

    @abstractmethod
    async def crear_condicion(self, condicion: Condicion) -> Condicion:
        """Crea una condición en el catálogo y la devuelve con su id."""

    @abstractmethod
    async def actualizar_condicion(self, condicion: Condicion) -> Condicion:
        """Actualiza una condición existente (identificada por id_condicion)."""

    @abstractmethod
    async def eliminar_condicion(self, id_condicion: int) -> None:
        """Elimina una condición del catálogo."""

    @abstractmethod
    async def obtener_categoria(self, id_categoria: int) -> Categoria | None:
        """Devuelve una categoría por su id, o None si no existe."""

    @abstractmethod
    async def crear_categoria(self, categoria: Categoria) -> Categoria:
        """Crea una categoría y la devuelve con su id."""

    @abstractmethod
    async def actualizar_categoria(self, categoria: Categoria) -> Categoria:
        """Actualiza una categoría existente (identificada por id_categoria)."""

    @abstractmethod
    async def eliminar_categoria(self, id_categoria: int) -> None:
        """Elimina una categoría (falla si tiene condiciones asociadas)."""
