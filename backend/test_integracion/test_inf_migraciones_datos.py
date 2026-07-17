"""INF — Migraciones y datos iniciales (casos INF-CPI001 a INF-CPI003).

Verifica que el esquema se construye desde cero con las migraciones de Alembic
y que los datos cargados por los seeds cumplen las propiedades que el sistema
asume: toda emergencia tiene protocolo y el grafo de navegación está cerrado
(ninguna referencia apunta a un paso inexistente).
"""

import os

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool

pytestmark = pytest.mark.asyncio(loop_scope="session")

TABLAS_ESPERADAS = {
    "usuario",
    "rol",
    "permiso",
    "perfil_clinico",
    "perfil_condicion",
    "condicion",
    "categoria",
    "emergencia",
    "protocolo",
    "paso",
    "alerta_regla",
}


async def _consultar(sql: str):
    engine = create_async_engine(os.environ["DATABASE_URL"], poolclass=NullPool)
    try:
        async with engine.connect() as conexion:
            resultado = await conexion.execute(text(sql))
            return resultado.fetchall()
    finally:
        await engine.dispose()


async def test_inf_cpi001_migraciones_construyen_esquema(base_de_datos_preparada):
    """INF-CPI001: `alembic upgrade head` sobre una base vacía crea todas las
    tablas del modelo de datos."""
    filas = await _consultar(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    )
    tablas = {fila[0] for fila in filas}
    faltantes = TABLAS_ESPERADAS - tablas
    assert not faltantes, f"Tablas ausentes tras las migraciones: {sorted(faltantes)}"


async def test_inf_cpi002_toda_emergencia_tiene_protocolo(base_de_datos_preparada):
    """INF-CPI002: tras el seed, cada emergencia del catálogo tiene al menos un
    paso de protocolo con instrucción no vacía (excepción de CU-007:
    'protocolo no cargado' no debe ocurrir con los datos oficiales)."""
    filas = await _consultar(
        """
        SELECT e.id_emergencia
        FROM emergencia e
        LEFT JOIN protocolo p
          ON p.id_emergencia = e.id_emergencia AND COALESCE(p.instruccion, '') <> ''
        GROUP BY e.id_emergencia
        HAVING COUNT(p.id_protocolo) = 0
        """
    )
    sin_protocolo = [fila[0] for fila in filas]
    assert not sin_protocolo, f"Emergencias sin protocolo cargado: {sin_protocolo}"


async def test_inf_cpi003_grafo_de_navegacion_cerrado(base_de_datos_preparada):
    """INF-CPI003: toda referencia de navegación no nula (paso siguiente sí/no,
    anexo sí/no) apunta a un protocolo existente."""
    referencias_rotas = []
    for columna in ("paso_siguiente", "paso_siguiente_no", "anexo_si", "anexo_no"):
        filas = await _consultar(
            f"""
            SELECT s.id_protocolo, s.{columna}
            FROM paso s
            WHERE s.{columna} IS NOT NULL
              AND s.{columna} NOT IN (SELECT id_protocolo FROM protocolo)
            """
        )
        referencias_rotas.extend(
            f"{fila[0]} -> {columna}={fila[1]}" for fila in filas
        )
    assert not referencias_rotas, f"Referencias rotas en el grafo: {referencias_rotas}"
