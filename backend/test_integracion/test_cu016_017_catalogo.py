"""CU-016/CU-017 — Catálogo contra la base real (CU016-CPI001, CU017-CPI001).

Verifica la clave foránea condición → categoría y la protección de una
categoría con condiciones asociadas, restricciones que viven en el esquema de
PostgreSQL y que los unit tests no pueden demostrar con fakes.

CU017-CPI001 crea su propia categoría y condición para no alterar el catálogo
del seed.
"""

import pytest

pytestmark = pytest.mark.asyncio(loop_scope="session")


async def test_cu016_cpi001_condicion_con_categoria_inexistente_rechazada(
    client, admin_headers
):
    """CU016-CPI001: crear una condición apuntando a una categoría que no
    existe debe producir un rechazo controlado (4xx), no un 5xx."""
    respuesta = await client.post(
        "/admin/condiciones",
        headers=admin_headers,
        json={
            "nombre_condicion": "Condición de integración",
            "descripcion_condicion": "Apunta a una categoría inexistente.",
            "id_categoria": 999999,
        },
    )
    assert 400 <= respuesta.status_code < 500, (
        f"Se esperaba rechazo controlado (4xx) y se obtuvo "
        f"{respuesta.status_code}: {respuesta.text}"
    )
    assert respuesta.json().get("detail"), "El rechazo no incluye mensaje"


async def test_cu017_cpi001_categoria_con_condiciones_protegida(client, admin_headers):
    """CU017-CPI001: eliminar una categoría que tiene condiciones asociadas
    debe producir un rechazo controlado (4xx) que explique la causa."""
    categoria = await client.post(
        "/admin/categorias",
        headers=admin_headers,
        json={"nombre_categoria": "Categoría de integración"},
    )
    assert categoria.status_code == 201, categoria.text
    id_categoria = categoria.json()["id_categoria"]

    condicion = await client.post(
        "/admin/condiciones",
        headers=admin_headers,
        json={
            "nombre_condicion": "Condición asociada de integración",
            "descripcion_condicion": "Impide eliminar su categoría.",
            "id_categoria": id_categoria,
        },
    )
    assert condicion.status_code == 201, condicion.text

    eliminacion = await client.delete(
        f"/admin/categorias/{id_categoria}", headers=admin_headers
    )
    assert 400 <= eliminacion.status_code < 500, (
        f"Se esperaba rechazo controlado (4xx) y se obtuvo "
        f"{eliminacion.status_code}: {eliminacion.text}"
    )
    assert eliminacion.json().get("detail"), "El rechazo no incluye mensaje"
