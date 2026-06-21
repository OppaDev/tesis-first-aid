from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class Pagina(BaseModel, Generic[T]):
    """Respuesta paginada genérica para los listados."""

    items: list[T]
    total: int
    limit: int
    offset: int
