"""CU-017 Gestionar categorías de condiciones — casos CU017-CP001 … CU017-CP003."""

import pytest

from app.application.dtos.catalogo_admin_dto import CategoriaRequestDTO
from app.application.use_cases.actualizar_categoria import ActualizarCategoriaUseCase
from app.application.use_cases.crear_categoria import CrearCategoriaUseCase
from app.application.use_cases.eliminar_categoria import EliminarCategoriaUseCase
from app.domain.exceptions import NotFoundError
from conftest import FakeCondicionRepository


async def test_cu017_cp001_crear_categoria_valida():
    """CU017-CP001: crear una categoría válida devuelve su identificador."""
    repo = FakeCondicionRepository()

    resultado = await CrearCategoriaUseCase(repo).ejecutar(
        CategoriaRequestDTO(nombre_categoria="Enfermedades crónicas")
    )

    assert resultado.id_categoria == 1
    assert resultado.nombre_categoria == "Enfermedades crónicas"
    assert 1 in repo.categorias


async def test_cu017_cp002_actualizar_inexistente():
    """CU017-CP002: editar una categoría que no existe → recurso no encontrado."""
    with pytest.raises(NotFoundError) as exc:
        await ActualizarCategoriaUseCase(FakeCondicionRepository()).ejecutar(
            999, CategoriaRequestDTO(nombre_categoria="Alergias")
        )
    assert str(exc.value) == "La categoría no existe"


async def test_cu017_cp003_eliminar_inexistente():
    """CU017-CP003: eliminar una categoría que no existe → recurso no encontrado."""
    with pytest.raises(NotFoundError) as exc:
        await EliminarCategoriaUseCase(FakeCondicionRepository()).ejecutar(999)
    assert str(exc.value) == "La categoría no existe"
