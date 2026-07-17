"""CU-015 — Reglas de alerta contra la base real (CU015-CPI001 a CPI003).

Verifica las restricciones que el README de cp-backend dejó para integración:
unicidad del par (condición, emergencia) y clave foránea hacia el catálogo,
ambas definidas en el esquema de PostgreSQL.

Se usa un par (condición, emergencia) que NO existe en el seed de reglas
(Epilepsia x E0001) para no depender de su contenido ni alterarlo.
"""

import pytest

pytestmark = pytest.mark.asyncio(loop_scope="session")


async def _id_condicion(client, nombre: str) -> int:
    catalogo = await client.get("/condiciones")
    assert catalogo.status_code == 200, catalogo.text
    for categoria in catalogo.json():
        for condicion in categoria["condiciones"]:
            if condicion["nombre_condicion"] == nombre:
                return condicion["id_condicion"]
    raise AssertionError(f"El seed no cargó la condición {nombre!r}")


async def test_cu015_cpi001_crear_regla_valida_persiste(client, admin_headers):
    """CU015-CPI001: el administrador crea una regla válida (201) y la regla
    queda persistida (aparece al consultarla por id)."""
    id_epilepsia = await _id_condicion(client, "Epilepsia")
    creacion = await client.post(
        "/admin/reglas",
        headers=admin_headers,
        json={
            "id_condicion": id_epilepsia,
            "id_emergencia": "E0001",
            "mensaje": "Prueba de integración: precaución específica para epilepsia.",
            "severidad": "media",
        },
    )
    assert creacion.status_code == 201, creacion.text
    id_regla = creacion.json()["id_regla"]

    consulta = await client.get(f"/admin/reglas/{id_regla}", headers=admin_headers)
    assert consulta.status_code == 200, consulta.text
    assert consulta.json()["id_emergencia"] == "E0001"


async def test_cu015_cpi002_par_condicion_emergencia_duplicado_rechazado(
    client, admin_headers
):
    """CU015-CPI002: crear una segunda regla para el mismo par (condición,
    emergencia) debe producir un rechazo controlado (4xx), no un 5xx: la
    unicidad la garantiza la base de datos."""
    id_epilepsia = await _id_condicion(client, "Epilepsia")
    duplicada = await client.post(
        "/admin/reglas",
        headers=admin_headers,
        json={
            "id_condicion": id_epilepsia,
            "id_emergencia": "E0001",
            "mensaje": "Intento duplicado del mismo par condición-emergencia.",
            "severidad": "baja",
        },
    )
    assert 400 <= duplicada.status_code < 500, (
        f"Se esperaba rechazo controlado (4xx) y se obtuvo "
        f"{duplicada.status_code}: {duplicada.text}"
    )
    assert duplicada.json().get("detail"), "El rechazo no incluye mensaje"


async def test_cu015_cpi003_condicion_inexistente_rechazada(client, admin_headers):
    """CU015-CPI003: crear una regla con una condición que no existe en el
    catálogo debe producir un rechazo controlado (4xx): la clave foránea la
    garantiza la base de datos."""
    respuesta = await client.post(
        "/admin/reglas",
        headers=admin_headers,
        json={
            "id_condicion": 999999,
            "id_emergencia": "E0001",
            "mensaje": "Regla con condición inexistente.",
            "severidad": "alta",
        },
    )
    assert 400 <= respuesta.status_code < 500, (
        f"Se esperaba rechazo controlado (4xx) y se obtuvo "
        f"{respuesta.status_code}: {respuesta.text}"
    )
    assert respuesta.json().get("detail"), "El rechazo no incluye mensaje"
