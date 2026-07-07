"""CU-015 Gestionar reglas de alerta — casos CU015-CP001 … CU015-CP004."""

import pytest
from pydantic import ValidationError as PydanticValidationError

from app.application.dtos.regla_alerta_dto import ReglaAlertaRequestDTO
from app.application.use_cases.actualizar_regla_alerta import ActualizarReglaAlertaUseCase
from app.application.use_cases.crear_regla_alerta import CrearReglaAlertaUseCase
from app.domain.exceptions import NotFoundError
from conftest import FakeAlertaReglaRepository


def _dto(**cambios) -> ReglaAlertaRequestDTO:
    datos = {
        "id_condicion": 1,
        "id_emergencia": "quemadura",
        "mensaje": "Controle su glucosa durante la atención",
        "severidad": "alta",
    }
    datos.update(cambios)
    return ReglaAlertaRequestDTO(**datos)


async def test_cu015_cp001_crear_regla_valida():
    """CU015-CP001: crear una regla válida devuelve la regla con su identificador."""
    repo = FakeAlertaReglaRepository()

    resultado = await CrearReglaAlertaUseCase(repo).ejecutar(_dto())

    assert resultado.id_regla == 1
    assert resultado.id_condicion == 1
    assert resultado.id_emergencia == "quemadura"
    assert resultado.severidad == "alta"
    assert repo.reglas[1].mensaje == "Controle su glucosa durante la atención"


def test_cu015_cp002_severidad_invalida():
    """CU015-CP002: severidad fuera de crítica/alta/media/baja rechazada por el DTO."""
    with pytest.raises(PydanticValidationError):
        _dto(severidad="urgente")


def test_cu015_cp003_mensaje_vacio():
    """CU015-CP003: mensaje vacío rechazado por el DTO (longitud mínima 1)."""
    with pytest.raises(PydanticValidationError):
        _dto(mensaje="")


async def test_cu015_cp004_actualizar_regla_inexistente():
    """CU015-CP004: actualizar una regla que no existe → recurso no encontrado."""
    with pytest.raises(NotFoundError) as exc:
        await ActualizarReglaAlertaUseCase(FakeAlertaReglaRepository()).ejecutar(999, _dto())
    assert str(exc.value) == "La regla de alerta no existe"


def test_cu015_cp005_mensaje_supera_limite_rechazado():
    """CU015-CP005: el mensaje de la regla acepta hasta 300 caracteres y rechaza más."""
    import pydantic

    from app.application.dtos.regla_alerta_dto import ReglaAlertaRequestDTO

    ok = ReglaAlertaRequestDTO(
        id_condicion=1, id_emergencia="corte", mensaje="m" * 300, severidad="alta"
    )
    assert len(ok.mensaje) == 300
    with pytest.raises(pydantic.ValidationError):
        ReglaAlertaRequestDTO(
            id_condicion=1, id_emergencia="corte", mensaje="m" * 301, severidad="alta"
        )


def test_cu015_cp006_mensaje_con_etiquetas_saneado():
    """CU015-CP006: las etiquetas tipo HTML se eliminan del mensaje; un mensaje
    compuesto solo de etiquetas se rechaza."""
    import pydantic

    from app.application.dtos.regla_alerta_dto import ReglaAlertaRequestDTO

    regla = ReglaAlertaRequestDTO(
        id_condicion=1,
        id_emergencia="corte",
        mensaje="<script>alert(1)</script>Presione <b>fuerte</b> la herida",
        severidad="alta",
    )
    assert regla.mensaje == "alert(1)Presione fuerte la herida"

    with pytest.raises(pydantic.ValidationError):
        ReglaAlertaRequestDTO(
            id_condicion=1, id_emergencia="corte", mensaje="<b></b>", severidad="alta"
        )
