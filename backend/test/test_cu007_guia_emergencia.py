"""CU-007 Obtener guía de emergencia — casos CU007-CP001 … CU007-CP006."""

from app.application.use_cases.procesar_consulta import ProcesarConsultaUseCase
from app.domain.services.enrutador_service import EnrutadorService
from app.domain.services.recomendacion_service import RecomendacionService
from conftest import (
    CEDULA_VALIDA,
    FakeAlertaReglaRepository,
    FakeEmergenciaRepository,
    FakePerfilClinicoRepository,
    StubClasificador,
    StubQA,
    crear_condicion,
    crear_emergencia,
    crear_perfil,
    crear_regla,
)

NARRATIVA = "mi hijo se quemó con agua hirviendo"


def _use_case(emergencias=None, perfiles=None, reglas=None) -> ProcesarConsultaUseCase:
    return ProcesarConsultaUseCase(
        enrutador=EnrutadorService(),
        clasificador=StubClasificador("quemadura"),
        qa=StubQA(None),
        emergencia_repo=FakeEmergenciaRepository(emergencias),
        perfil_repo=FakePerfilClinicoRepository(perfiles),
        alerta_regla_repo=FakeAlertaReglaRepository(reglas),
        recomendacion=RecomendacionService(),
    )


async def test_cu007_cp001_narrativa_devuelve_protocolo_completo():
    """CU007-CP001: narrativa con protocolo cargado → pasos con decisiones y anexos."""
    resultado = await _use_case(emergencias=[crear_emergencia()]).ejecutar(NARRATIVA)

    assert resultado.tipo == "narrativa"
    assert resultado.emergencia_detectada == "quemadura"
    assert resultado.protocolo_encontrado is True
    assert len(resultado.protocolos) == 5
    numeros = [p.numero for p in resultado.protocolos]
    assert numeros == sorted(numeros)  # ordenados por número de paso
    decision = next(p for p in resultado.protocolos if p.id_protocolo == "C1")
    assert decision.es_condicion is True
    assert decision.paso.paso_siguiente == "P2"
    assert decision.paso.paso_siguiente_no == "P3"
    assert decision.paso.anexo_si == "A1"  # el anexo viaja en la respuesta


async def test_cu007_cp002_emergencia_sin_protocolo():
    """CU007-CP002: emergencia identificada pero sin protocolo cargado → mensaje."""
    resultado = await _use_case(emergencias=[]).ejecutar(NARRATIVA)

    assert resultado.protocolo_encontrado is False
    assert resultado.emergencia_detectada == "quemadura"
    assert resultado.mensaje == (
        "Emergencia identificada pero el protocolo aún no está cargado en la base de datos."
    )


async def test_cu007_cp003_alertas_personalizadas_con_perfil():
    """CU007-CP003: sesión + perfil con condición que coincide con una regla → alerta."""
    perfil = crear_perfil(condiciones=[crear_condicion(id_condicion=1, nombre="Diabetes")])
    regla = crear_regla(id_condicion=1, id_emergencia="EM01", severidad="alta")

    resultado = await _use_case(
        emergencias=[crear_emergencia()], perfiles=[perfil], reglas=[regla]
    ).ejecutar(NARRATIVA, cedula=CEDULA_VALIDA)

    assert len(resultado.alertas) == 1
    alerta = resultado.alertas[0]
    assert alerta.nombre_condicion == "Diabetes"
    assert alerta.mensaje == regla.mensaje
    assert alerta.severidad == "alta"
    assert len(resultado.protocolos) == 5  # el protocolo no se modifica (Regla de Oro)


def test_cu007_cp004_alertas_ordenadas_por_severidad():
    """CU007-CP004: las alertas se ordenan de la más grave a la menos grave."""
    condiciones = [
        crear_condicion(id_condicion=1, nombre="Asma"),
        crear_condicion(id_condicion=2, nombre="Hemofilia"),
        crear_condicion(id_condicion=3, nombre="Hipertensión"),
    ]
    reglas = [
        crear_regla(id_regla=1, id_condicion=1, severidad="baja", mensaje="m1"),
        crear_regla(id_regla=2, id_condicion=2, severidad="critica", mensaje="m2"),
        crear_regla(id_regla=3, id_condicion=3, severidad="media", mensaje="m3"),
    ]

    alertas = RecomendacionService().generar_alertas(condiciones, reglas)

    assert [a.severidad for a in alertas] == ["critica", "media", "baja"]


async def test_cu007_cp005_consulta_anonima_sin_alertas():
    """CU007-CP005: consulta sin sesión → protocolo con lista de alertas vacía."""
    resultado = await _use_case(
        emergencias=[crear_emergencia()],
        perfiles=[crear_perfil(condiciones=[crear_condicion()])],
        reglas=[crear_regla()],
    ).ejecutar(NARRATIVA, cedula=None)

    assert resultado.protocolo_encontrado is True
    assert resultado.alertas == []


async def test_cu007_cp006_sin_condiciones_coincidentes():
    """CU007-CP006: condiciones del perfil sin regla para la emergencia → sin alertas."""
    perfil = crear_perfil(condiciones=[crear_condicion(id_condicion=9, nombre="Migraña")])
    regla = crear_regla(id_condicion=1, id_emergencia="EM01")  # otra condición

    resultado = await _use_case(
        emergencias=[crear_emergencia()], perfiles=[perfil], reglas=[regla]
    ).ejecutar(NARRATIVA, cedula=CEDULA_VALIDA)

    assert resultado.protocolo_encontrado is True
    assert resultado.alertas == []
