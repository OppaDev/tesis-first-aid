"""Infraestructura de las pruebas de integración.

A diferencia de los unit tests (backend/test/, que usan fakes/stubs), esta suite
ejercita el sistema real: PostgreSQL con el esquema construido por las migraciones
de Alembic, los seeds oficiales del proyecto y la API completa (middleware,
validación, autenticación, casos de uso, repositorios SQLAlchemy y modelos de IA
reales) a través de peticiones HTTP sobre la aplicación ASGI.

Neutralidad: las pruebas se derivan de la especificación de casos de uso; ningún
componente de producción se modifica ni se sustituye. La base de datos de
desarrollo no se toca: se usa una base dedicada `firstaid_test` que se recrea
desde cero en cada corrida.
"""

import asyncio
import os
import subprocess
import sys
from pathlib import Path

import pytest
import pytest_asyncio
from sqlalchemy.engine.url import make_url

BACKEND = Path(__file__).parent.parent

BD_PRUEBAS = "firstaid_test"


def _url_base_desde_env() -> str:
    """Lee DATABASE_URL del .env del backend sin importar la app (settings y el
    engine son de nivel de módulo: el entorno debe fijarse ANTES de importarlos).
    La URL contiene credenciales: nunca imprimirla ni incluirla en aserciones."""
    for linea in (BACKEND / ".env").read_text(encoding="utf-8").splitlines():
        linea = linea.strip()
        if linea.startswith("DATABASE_URL="):
            return linea.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("DATABASE_URL no encontrada en backend/.env")


_URL_DESARROLLO = make_url(_url_base_desde_env())
URL_PRUEBAS = _URL_DESARROLLO.set(database=BD_PRUEBAS)

# Debe ocurrir antes de que cualquier módulo de la app se importe.
os.environ["DATABASE_URL"] = URL_PRUEBAS.render_as_string(hide_password=False)


async def _recrear_base_de_datos() -> None:
    import asyncpg

    conexion = await asyncpg.connect(
        user=_URL_DESARROLLO.username,
        password=_URL_DESARROLLO.password,
        host=_URL_DESARROLLO.host,
        port=_URL_DESARROLLO.port or 5432,
        database="postgres",
    )
    try:
        await conexion.execute(f'DROP DATABASE IF EXISTS "{BD_PRUEBAS}" WITH (FORCE)')
        await conexion.execute(f'CREATE DATABASE "{BD_PRUEBAS}"')
    finally:
        await conexion.close()


def _ejecutar(comando: list[str], descripcion: str) -> None:
    """Corre migraciones/seeds como los ejecuta el proyecto (subprocesos),
    contra la base de pruebas. Un fallo aquí es un hallazgo de integración."""
    entorno = {**os.environ, "DATABASE_URL": os.environ["DATABASE_URL"]}
    resultado = subprocess.run(
        comando,
        cwd=BACKEND,
        env=entorno,
        capture_output=True,
        text=True,
        timeout=300,
    )
    if resultado.returncode != 0:
        pytest.exit(
            f"Fallo de integración al preparar la base ({descripcion}):\n"
            f"{resultado.stdout}\n{resultado.stderr}",
            returncode=1,
        )


@pytest.fixture(scope="session", autouse=True)
def base_de_datos_preparada():
    """Recrea firstaid_test, aplica las 9 migraciones y corre los seeds oficiales."""
    asyncio.run(_recrear_base_de_datos())
    _ejecutar([sys.executable, "-m", "alembic", "upgrade", "head"], "alembic upgrade head")
    # Orden por dependencias: las alertas referencian condiciones (seed_condiciones)
    # y emergencias (seed.py), así que seed_alertas va al final.
    for script in (
        "seed_roles.py",
        "seed_admin.py",
        "seed_condiciones.py",
        "seed.py",
        "seed_alertas.py",
    ):
        _ejecutar([sys.executable, str(Path("scripts") / script)], script)
    yield


@pytest_asyncio.fixture(scope="session", loop_scope="session")
async def client(base_de_datos_preparada):
    """Cliente HTTP real sobre la aplicación ASGI completa (middleware incluido)."""
    from httpx import ASGITransport, AsyncClient

    from main import app

    transporte = ASGITransport(app=app)
    async with AsyncClient(transport=transporte, base_url="http://testserver") as cliente:
        yield cliente


@pytest_asyncio.fixture(scope="session", loop_scope="session")
async def admin_headers(client):
    """Token del administrador creado por scripts/seed_admin.py (un solo login
    por corrida: el límite de tasa real del login queda activo)."""
    respuesta = await client.post(
        "/auth/login",
        json={"email": "admin@sanfra.com", "password": "admin123"},
    )
    assert respuesta.status_code == 200, (
        f"No se pudo iniciar sesión con el administrador del seed: "
        f"{respuesta.status_code} {respuesta.text}"
    )
    token = respuesta.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
