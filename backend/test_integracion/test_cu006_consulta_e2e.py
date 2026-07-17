"""CU-006/CU-007/CU-008 — Consulta de extremo a extremo (CPI de consulta).

La petición atraviesa el sistema completo y real: enrutador de dominio,
clasificador BETO, sistema QA MiniLM, repositorios SQLAlchemy y PostgreSQL con
los protocolos y reglas cargados por los seeds oficiales. Sin stubs.

Resultados esperados según la especificación:
 - CU-006/CU-007: una narrativa de emergencia devuelve la guía con el protocolo
   paso a paso de la emergencia detectada;
 - CU-008: una pregunta devuelve una respuesta de la base de conocimiento o un
   mensaje de que no hay respuesta disponible (ambas válidas);
 - CU-007 (autenticado): las condiciones del perfil se cruzan con las reglas y
   las alertas se anteponen SIN modificar el protocolo (Regla de Oro).
"""

import pytest

pytestmark = pytest.mark.asyncio(loop_scope="session")

CEDULA_RESCATISTA = "0102030418"

RESCATISTA = {
    "cedula": CEDULA_RESCATISTA,
    "nombres": "Luis Alberto",
    "apellidos": "Mora Sánchez",
    "fecha_nacimiento": "1985-03-20",
    "email": "luis.integracion@mail.com",
    "password": "Segura#2026",
}

# Narrativa inequívoca de golpe en la cabeza: el seed de reglas define para esa
# emergencia una alerta CRÍTICA por uso de anticoagulantes.
NARRATIVA_GOLPE_CABEZA = (
    "Mi papá se cayó por las escaleras, se golpeó la cabeza y está mareado"
)


async def test_cu006_cpi001_narrativa_devuelve_guia_real(client):
    """CU006-CPI001: una narrativa de emergencia se clasifica con BETO real y
    devuelve el protocolo con pasos desde la base de datos."""
    respuesta = await client.post(
        "/consulta",
        json={"texto": "Me corté la mano con un cuchillo y sangra mucho"},
    )
    assert respuesta.status_code == 200, respuesta.text
    datos = respuesta.json()
    assert datos["tipo"] == "narrativa"
    assert datos["emergencia_detectada"], "No se detectó ninguna emergencia"
    assert datos["protocolo_encontrado"] is True, (
        f"Sin protocolo para la emergencia detectada: {datos['emergencia_detectada']!r}"
    )
    assert datos["protocolos"], "La guía no incluye pasos"
    assert all(p["instruccion"] for p in datos["protocolos"])


async def test_cu006_cpi002_pregunta_se_enruta_al_qa(client):
    """CU006-CPI002 (CU-008): una pregunta se enruta al sistema QA real; la
    especificación admite una respuesta de la base de conocimiento o el mensaje
    de que no hay respuesta segura."""
    respuesta = await client.post(
        "/consulta",
        json={"texto": "¿Qué debo hacer si alguien se está atragantando?"},
    )
    assert respuesta.status_code == 200, respuesta.text
    datos = respuesta.json()
    assert datos["tipo"] == "pregunta"
    assert datos.get("respuesta") or datos.get("mensaje"), (
        "Ni respuesta ni mensaje de no disponibilidad"
    )


async def test_cu007_cpi001_alertas_personalizadas_sin_alterar_protocolo(client):
    """CU007-CPI001: un usuario autenticado cuyo perfil clínico registra uso de
    anticoagulantes consulta un golpe en la cabeza: el motor de reglas real debe
    anteponer la alerta de su condición y el protocolo debe ser idéntico al de
    la consulta anónima (Regla de Oro)."""
    # Referencia anónima: misma narrativa, sin sesión -> sin alertas.
    anonima = await client.post("/consulta", json={"texto": NARRATIVA_GOLPE_CABEZA})
    assert anonima.status_code == 200, anonima.text
    datos_anonimos = anonima.json()
    assert datos_anonimos["alertas"] == [], "La consulta anónima no debe traer alertas"

    # Usuario real con perfil clínico: condición "Uso de anticoagulantes" del seed.
    registro = await client.post("/auth/registro", json=RESCATISTA)
    assert registro.status_code == 201, registro.text
    login = await client.post(
        "/auth/login",
        json={"email": RESCATISTA["email"], "password": RESCATISTA["password"]},
    )
    assert login.status_code == 200, login.text
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    catalogo = await client.get("/condiciones")
    assert catalogo.status_code == 200, catalogo.text
    anticoagulantes = next(
        (
            condicion
            for categoria in catalogo.json()
            for condicion in categoria["condiciones"]
            if condicion["nombre_condicion"] == "Uso de anticoagulantes"
        ),
        None,
    )
    assert anticoagulantes, "El seed no cargó la condición 'Uso de anticoagulantes'"

    perfil = await client.post(
        "/perfil",
        headers=headers,
        json={
            "genero": "Masculino",
            "tipo_sangre": "O+",
            "altura_cm": 170,
            "peso_kg": 72,
            "condiciones": [{"id_condicion": anticoagulantes["id_condicion"], "detalle": None}],
        },
    )
    assert perfil.status_code == 201, perfil.text

    autenticada = await client.post(
        "/consulta", headers=headers, json={"texto": NARRATIVA_GOLPE_CABEZA}
    )
    assert autenticada.status_code == 200, autenticada.text
    datos = autenticada.json()

    assert datos["alertas"], (
        f"El perfil tiene una condición con regla para la emergencia detectada "
        f"({datos['emergencia_detectada']!r}) y no se generaron alertas"
    )
    nombres_alertados = {alerta["nombre_condicion"] for alerta in datos["alertas"]}
    assert "Uso de anticoagulantes" in nombres_alertados
    assert all(
        alerta["severidad"] in {"critica", "alta", "media", "baja"}
        for alerta in datos["alertas"]
    )

    # Regla de Oro: el protocolo autenticado es idéntico al anónimo.
    assert datos["emergencia_detectada"] == datos_anonimos["emergencia_detectada"]
    assert datos["protocolos"] == datos_anonimos["protocolos"], (
        "El protocolo cambió con el perfil clínico: viola la Regla de Oro"
    )
