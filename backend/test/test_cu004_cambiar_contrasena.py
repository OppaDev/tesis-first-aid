"""CU-004 Cambiar contraseña — casos CU004-CP001 … CU004-CP005."""

import pytest
from pydantic import ValidationError as PydanticValidationError

from app.application.dtos.auth_dto import CambiarPasswordRequestDTO
from app.application.use_cases.cambiar_password_usuario import CambiarPasswordUsuarioUseCase
from app.domain.exceptions import NotFoundError, ValidationError
from app.infrastructure.security.jwt import verificar_token
from app.infrastructure.security.password import verificar
from conftest import CEDULA_VALIDA, PASSWORD_VALIDA, FakeUsuarioRepository, crear_usuario


async def test_cu004_cp001_cambio_valido():
    """CU004-CP001: cambio válido → hash nuevo, otras sesiones revocadas y token nuevo."""
    repo = FakeUsuarioRepository([crear_usuario(token_version=0)])

    resultado = await CambiarPasswordUsuarioUseCase(repo).ejecutar(
        CEDULA_VALIDA, PASSWORD_VALIDA, "Distinta#2027"
    )

    guardado = repo.usuarios[CEDULA_VALIDA]
    assert verificar("Distinta#2027", guardado.password)
    assert guardado.token_version == 1  # revoca las demás sesiones
    payload = verificar_token(resultado.access_token)
    assert payload is not None
    assert payload["token_version"] == 1  # la sesión actual sigue viva con token nuevo


async def test_cu004_cp002_actual_incorrecta():
    """CU004-CP002: contraseña actual incorrecta → rechazo sin cambios."""
    repo = FakeUsuarioRepository([crear_usuario()])

    with pytest.raises(ValidationError) as exc:
        await CambiarPasswordUsuarioUseCase(repo).ejecutar(
            CEDULA_VALIDA, "Erronea#123", "Distinta#2027"
        )
    assert str(exc.value) == "La contraseña actual es incorrecta"
    assert verificar(PASSWORD_VALIDA, repo.usuarios[CEDULA_VALIDA].password)


async def test_cu004_cp003_nueva_igual_a_actual():
    """CU004-CP003: la nueva contraseña no puede ser igual a la actual."""
    repo = FakeUsuarioRepository([crear_usuario()])

    with pytest.raises(ValidationError) as exc:
        await CambiarPasswordUsuarioUseCase(repo).ejecutar(
            CEDULA_VALIDA, PASSWORD_VALIDA, PASSWORD_VALIDA
        )
    assert str(exc.value) == "La nueva contraseña debe ser distinta a la actual"


async def test_cu004_cp004_usuario_inexistente():
    """CU004-CP004: usuario inexistente → recurso no encontrado."""
    repo = FakeUsuarioRepository()

    with pytest.raises(NotFoundError) as exc:
        await CambiarPasswordUsuarioUseCase(repo).ejecutar(
            CEDULA_VALIDA, PASSWORD_VALIDA, "Distinta#2027"
        )
    assert str(exc.value) == "Usuario no encontrado"


def test_cu004_cp005_nueva_no_cumple_politica():
    """CU004-CP005: la nueva contraseña debe cumplir la política (DTO la valida)."""
    with pytest.raises(PydanticValidationError):
        CambiarPasswordRequestDTO(password_actual=PASSWORD_VALIDA, password_nueva="corta1")
