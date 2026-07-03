"""CU-001 Registrar usuario — casos CU001-CP001 … CU001-CP009."""

from datetime import date

import pytest

from app.application.dtos.auth_dto import RegistroRequestDTO
from app.application.dtos.password_validator import validar_password
from app.application.use_cases.registrar_usuario import RegistrarUsuarioUseCase
from app.domain.entities.usuario import Usuario
from app.domain.exceptions import ValidationError
from app.infrastructure.security.password import verificar
from conftest import CEDULA_INVALIDA, CEDULA_VALIDA_2, FakeUsuarioRepository, crear_usuario


def _dto_valido(**cambios) -> RegistroRequestDTO:
    datos = {
        "cedula": CEDULA_VALIDA_2,
        "nombres": "Luis",
        "apellidos": "Andrade",
        "fecha_nacimiento": date(1995, 3, 15),
        "email": "luis@mail.com",
        "password": "Segura#2026",
    }
    datos.update(cambios)
    return RegistroRequestDTO(**datos)


async def test_cu001_cp001_registro_valido():
    """CU001-CP001: registro válido crea el usuario con rol usuario y contraseña hasheada."""
    repo = FakeUsuarioRepository()
    resultado = await RegistrarUsuarioUseCase(repo).ejecutar(_dto_valido())

    assert resultado.cedula == CEDULA_VALIDA_2
    assert resultado.id_rol == 2  # rol usuario
    guardado = repo.usuarios[CEDULA_VALIDA_2]
    assert guardado.password != "Segura#2026"  # nunca en texto plano
    assert verificar("Segura#2026", guardado.password)


def test_cu001_cp002_password_corta():
    """CU001-CP002: contraseña de menos de 8 caracteres rechazada."""
    with pytest.raises(ValueError) as exc:
        validar_password("Abc#12")
    assert str(exc.value) == "La contraseña debe tener al menos 8 caracteres"


def test_cu001_cp003_password_sin_mayuscula():
    """CU001-CP003: contraseña sin mayúscula rechazada."""
    with pytest.raises(ValueError) as exc:
        validar_password("segura#2026")
    assert str(exc.value) == "La contraseña debe incluir al menos una mayúscula"


def test_cu001_cp004_password_sin_minuscula():
    """CU001-CP004: contraseña sin minúscula rechazada."""
    with pytest.raises(ValueError) as exc:
        validar_password("SEGURA#2026")
    assert str(exc.value) == "La contraseña debe incluir al menos una minúscula"


def test_cu001_cp005_password_sin_caracter_especial():
    """CU001-CP005: contraseña sin carácter especial rechazada."""
    with pytest.raises(ValueError) as exc:
        validar_password("Segura2026")
    assert str(exc.value) == "La contraseña debe incluir al menos un carácter especial"


async def test_cu001_cp006_duplicado_mensaje_unificado():
    """CU001-CP006: cédula o correo ya registrados → mensaje unificado anti-enumeración."""
    existente = crear_usuario(email="luis@mail.com")  # mismo correo que el DTO
    repo = FakeUsuarioRepository([existente])

    with pytest.raises(ValidationError) as exc:
        await RegistrarUsuarioUseCase(repo).ejecutar(_dto_valido())
    assert str(exc.value) == "Ya existe una cuenta con esos datos"


def test_cu001_cp007_cedula_invalida():
    """CU001-CP007: cédula ecuatoriana con dígito verificador incorrecto rechazada."""
    with pytest.raises(ValidationError) as exc:
        crear_usuario(cedula=CEDULA_INVALIDA)
    assert str(exc.value) == "La cédula ecuatoriana no es válida"


def test_cu001_cp008_email_invalido():
    """CU001-CP008: correo sin formato válido rechazado."""
    with pytest.raises(ValidationError) as exc:
        crear_usuario(email="ana-mail.com")
    assert str(exc.value) == "El email no tiene un formato válido"


def test_cu001_cp009_fecha_nacimiento_no_anterior_a_hoy():
    """CU001-CP009: fecha de nacimiento igual o posterior a hoy rechazada."""
    with pytest.raises(ValidationError) as exc:
        Usuario(
            cedula=CEDULA_VALIDA_2,
            nombres="Luis",
            apellidos="Andrade",
            fecha_nacimiento=date.today(),
            email="luis@mail.com",
            password="hash",
        )
    assert str(exc.value) == "La fecha de nacimiento debe ser anterior a hoy"
