"""CU-011 Gestionar perfil clínico propio — casos CU011-CP001 … CU011-CP008.
(Las mismas validaciones cubren CU-014, que reutiliza la entidad.)"""

from datetime import date, timedelta

import pytest

from app.domain.entities.perfil_clinico import PerfilClinico
from app.domain.exceptions import ValidationError
from conftest import crear_condicion, crear_perfil, crear_usuario


def _perfil(**cambios) -> PerfilClinico:
    datos = {"genero": "Femenino", "tipo_sangre": "O+", "altura_cm": 175.0, "peso_kg": 70.0}
    datos.update(cambios)
    return PerfilClinico(**datos)


def _nacimiento(objetivo: date, anios: int) -> date:
    """Fecha de nacimiento cuyo cumpleaños cae en la fecha objetivo, hace `anios` años."""
    try:
        return objetivo.replace(year=objetivo.year - anios)
    except ValueError:  # 29 de febrero en año no bisiesto
        return objetivo.replace(year=objetivo.year - anios, month=3, day=1)


def test_cu011_cp001_imc_calculado():
    """CU011-CP001: IMC con altura 175 cm y peso 70 kg = 22.86 (2 decimales)."""
    assert _perfil().imc == 22.86


def test_cu011_cp002_imc_none_si_faltan_datos():
    """CU011-CP002: sin altura o sin peso el IMC es None, sin errores."""
    assert _perfil(altura_cm=None).imc is None
    assert _perfil(peso_kg=None).imc is None


def test_cu011_cp003_altura_no_positiva():
    """CU011-CP003: altura menor o igual a cero rechazada."""
    for altura in (0, -170):
        with pytest.raises(ValidationError) as exc:
            _perfil(altura_cm=altura)
        assert str(exc.value) == "La altura debe ser mayor a cero"


def test_cu011_cp004_peso_no_positivo():
    """CU011-CP004: peso menor o igual a cero rechazado."""
    for peso in (0, -70):
        with pytest.raises(ValidationError) as exc:
            _perfil(peso_kg=peso)
        assert str(exc.value) == "El peso debe ser mayor a cero"


def test_cu011_cp005_tipo_sangre_invalido():
    """CU011-CP005: tipo de sangre fuera del catálogo rechazado con los valores permitidos."""
    with pytest.raises(ValidationError) as exc:
        _perfil(tipo_sangre="X+")
    mensaje = str(exc.value)
    assert "Tipo de sangre inválido: X+" in mensaje
    for tipo in ("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"):
        assert tipo in mensaje


def test_cu011_cp006_edad_cumpleanos_ya_paso():
    """CU011-CP006: cumpleaños ya pasado este año → años completos."""
    ayer = date.today() - timedelta(days=1)
    usuario = crear_usuario()
    usuario.fecha_nacimiento = _nacimiento(ayer, 30)
    assert usuario.edad == 30


def test_cu011_cp007_edad_cumpleanos_aun_no_llega():
    """CU011-CP007: cumpleaños aún no llega este año → un año menos."""
    manana = date.today() + timedelta(days=1)
    usuario = crear_usuario()
    usuario.fecha_nacimiento = _nacimiento(manana, 30)
    assert usuario.edad == 29


def test_cu011_cp008_no_duplica_condiciones():
    """CU011-CP008: agregar dos veces la misma condición la deja una sola vez."""
    perfil = crear_perfil()
    condicion = crear_condicion(id_condicion=1)

    perfil.agregar_condicion(condicion)
    perfil.agregar_condicion(condicion)

    assert len(perfil.condiciones) == 1
