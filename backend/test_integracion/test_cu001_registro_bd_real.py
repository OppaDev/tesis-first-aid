"""CU-001 — Registrar usuario contra la base de datos real (CU001-CPI001 a CPI003).

Cubre lo que los unit tests no pueden demostrar con fakes: la persistencia real
y las restricciones de unicidad de cédula y correo del esquema.

Los casos se ejecutan en orden: el registro válido (CPI001) crea al usuario que
los casos de duplicado (CPI002 y CPI003) intentan repetir. El límite de tasa
real del registro (5/min) permanece activo: la suite hace 4 registros en total.
"""

import pytest

pytestmark = pytest.mark.asyncio(loop_scope="session")

# Cédulas con dígito verificador correcto (mismas del conftest unitario);
# la base de pruebas nace vacía de usuarios salvo el administrador del seed.
CEDULA_USUARIO_BASE = "1710034065"
CEDULA_ALTERNATIVA = "0102030400"

USUARIO_BASE = {
    "cedula": CEDULA_USUARIO_BASE,
    "nombres": "Ana María",
    "apellidos": "Pérez Vela",
    "fecha_nacimiento": "1990-05-10",
    "email": "ana.integracion@mail.com",
    "password": "Segura#2026",
}


async def test_cu001_cpi001_registro_valido_persiste(client):
    """CU001-CPI001: un registro con datos válidos responde 201 y el usuario
    queda persistido (el inicio de sesión posterior funciona)."""
    respuesta = await client.post("/auth/registro", json=USUARIO_BASE)
    assert respuesta.status_code == 201, respuesta.text

    login = await client.post(
        "/auth/login",
        json={"email": USUARIO_BASE["email"], "password": USUARIO_BASE["password"]},
    )
    assert login.status_code == 200, login.text
    assert login.json().get("access_token")


async def test_cu001_cpi002_cedula_duplicada_rechazada(client):
    """CU001-CPI002: registrar la misma cédula con otro correo debe producir un
    rechazo controlado (4xx con mensaje claro), no un error interno (5xx)."""
    duplicado = {**USUARIO_BASE, "email": "otro.correo@mail.com"}
    respuesta = await client.post("/auth/registro", json=duplicado)
    assert 400 <= respuesta.status_code < 500, (
        f"Se esperaba rechazo controlado (4xx) y se obtuvo "
        f"{respuesta.status_code}: {respuesta.text}"
    )
    assert respuesta.json().get("detail"), "El rechazo no incluye mensaje"


async def test_cu001_cpi003_correo_duplicado_rechazado(client):
    """CU001-CPI003: registrar el mismo correo con otra cédula debe producir un
    rechazo controlado (4xx con mensaje claro), no un error interno (5xx)."""
    duplicado = {**USUARIO_BASE, "cedula": CEDULA_ALTERNATIVA}
    respuesta = await client.post("/auth/registro", json=duplicado)
    assert 400 <= respuesta.status_code < 500, (
        f"Se esperaba rechazo controlado (4xx) y se obtuvo "
        f"{respuesta.status_code}: {respuesta.text}"
    )
    assert respuesta.json().get("detail"), "El rechazo no incluye mensaje"
