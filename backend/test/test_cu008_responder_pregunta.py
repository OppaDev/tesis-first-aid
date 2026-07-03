"""CU-008 Responder pregunta de primeros auxilios — casos CU008-CP001 y CU008-CP002."""

from app.application.use_cases.procesar_consulta import ProcesarConsultaUseCase
from app.domain.services.enrutador_service import EnrutadorService
from app.domain.services.recomendacion_service import RecomendacionService
from conftest import (
    FakeAlertaReglaRepository,
    FakeEmergenciaRepository,
    FakePerfilClinicoRepository,
    StubClasificador,
    StubQA,
)


def _use_case(qa: StubQA) -> ProcesarConsultaUseCase:
    return ProcesarConsultaUseCase(
        enrutador=EnrutadorService(),
        clasificador=StubClasificador(),
        qa=qa,
        emergencia_repo=FakeEmergenciaRepository(),
        perfil_repo=FakePerfilClinicoRepository(),
        alerta_regla_repo=FakeAlertaReglaRepository(),
        recomendacion=RecomendacionService(),
    )


async def test_cu008_cp001_pregunta_con_respuesta():
    """CU008-CP001: el sistema QA tiene una respuesta segura → se devuelve tal cual."""
    respuesta_qa = "Presione fuerte y rápido en el centro del pecho, 100 a 120 veces por minuto."
    resultado = await _use_case(StubQA(respuesta_qa)).ejecutar("¿Cómo hago RCP?")

    assert resultado.tipo == "pregunta"
    assert resultado.respuesta == respuesta_qa
    assert resultado.mensaje is None


async def test_cu008_cp002_sin_respuesta_segura():
    """CU008-CP002: sin respuesta segura → mensaje de derivación a emergencias."""
    resultado = await _use_case(StubQA(None)).ejecutar("¿Cuál es la capital de Francia?")

    assert resultado.tipo == "pregunta"
    assert resultado.respuesta is None
    assert resultado.mensaje == (
        "No encontré información segura para esa situación. "
        "Por favor contacta a los servicios de emergencia."
    )
