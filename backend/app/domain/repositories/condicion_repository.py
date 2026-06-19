from abc import ABC, abstractmethod

from app.domain.entities.categoria import Categoria


class CondicionRepository(ABC):
    @abstractmethod
    async def listar_catalogo(self) -> list[Categoria]:
        """Devuelve las categorías con sus condiciones, para poblar el formulario de perfil."""
