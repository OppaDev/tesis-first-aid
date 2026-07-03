"""CU-016 Gestionar condiciones médicas — casos CU016-CP001 … CU016-CP003."""

import pytest

from app.application.dtos.catalogo_admin_dto import CondicionRequestDTO
from app.application.use_cases.actualizar_condicion import ActualizarCondicionUseCase
from app.application.use_cases.crear_condicion import CrearCondicionUseCase
from app.application.use_cases.eliminar_condicion import EliminarCondicionUseCase
from app.domain.exceptions import NotFoundError
from conftest import FakeCondicionRepository


def _dto() -> CondicionRequestDTO:
    return CondicionRequestDTO(
        nombre_condicion="Diabetes",
        descripcion_condicion="Alteración crónica de la glucosa",
        id_categoria=1,
    )


async def test_cu016_cp001_crear_condicion_valida():
    """CU016-CP001: crear una condición válida la asocia a su categoría con identificador."""
    repo = FakeCondicionRepository()

    resultado = await CrearCondicionUseCase(repo).ejecutar(_dto())

    assert resultado.id_condicion == 1
    assert resultado.nombre_condicion == "Diabetes"
    assert resultado.id_categoria == 1
    assert 1 in repo.condiciones


async def test_cu016_cp002_actualizar_inexistente():
    """CU016-CP002: editar una condición que no existe → recurso no encontrado."""
    with pytest.raises(NotFoundError) as exc:
        await ActualizarCondicionUseCase(FakeCondicionRepository()).ejecutar(999, _dto())
    assert str(exc.value) == "La condición no existe"


async def test_cu016_cp003_eliminar_inexistente():
    """CU016-CP003: eliminar una condición que no existe → recurso no encontrado."""
    with pytest.raises(NotFoundError) as exc:
        await EliminarCondicionUseCase(FakeCondicionRepository()).ejecutar(999)
    assert str(exc.value) == "La condición no existe"
