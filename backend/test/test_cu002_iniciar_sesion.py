"""CU-002 Iniciar sesión — casos CU002-CP001 … CU002-CP003."""

import pytest

from app.application.dtos.auth_dto import LoginRequestDTO
from app.application.use_cases.login_usuario import LoginUsuarioUseCase
from app.domain.exceptions import ValidationError
from app.infrastructure.security.jwt import verificar_token
from conftest import CEDULA_VALIDA, PASSWORD_VALIDA, FakeUsuarioRepository, crear_usuario


async def test_cu002_cp001_login_valido_devuelve_token_con_datos():
    """CU002-CP001: credenciales válidas → JWT con cédula, correo, rol y versión de sesión."""
    repo = FakeUsuarioRepository([crear_usuario()])
    dto = LoginRequestDTO(email="ana@mail.com", password=PASSWORD_VALIDA)

    resultado = await LoginUsuarioUseCase(repo).ejecutar(dto)

    payload = verificar_token(resultado.access_token)
    assert payload is not None
    assert payload["sub"] == CEDULA_VALIDA
    assert payload["email"] == "ana@mail.com"
    assert payload["rol"] == 2
    assert payload["token_version"] == 0


async def test_cu002_cp002_password_incorrecta():
    """CU002-CP002: contraseña incorrecta → «Credenciales incorrectas», sin token."""
    repo = FakeUsuarioRepository([crear_usuario()])
    dto = LoginRequestDTO(email="ana@mail.com", password="Erronea#123")

    with pytest.raises(ValidationError) as exc:
        await LoginUsuarioUseCase(repo).ejecutar(dto)
    assert str(exc.value) == "Credenciales incorrectas"


async def test_cu002_cp003_email_no_registrado_mismo_mensaje():
    """CU002-CP003: correo inexistente → mensaje idéntico al de contraseña incorrecta."""
    repo = FakeUsuarioRepository()
    dto = LoginRequestDTO(email="noexiste@mail.com", password="Cualquiera#1")

    with pytest.raises(ValidationError) as exc:
        await LoginUsuarioUseCase(repo).ejecutar(dto)
    assert str(exc.value) == "Credenciales incorrectas"


async def test_cu002_cp004_confiar_dispositivo_emite_token_de_larga_duracion():
    """CU002-CP004: con confiar_dispositivo el token dura días (sesión persistente);
    sin el flag conserva la duración corta por defecto."""
    import time

    repo = FakeUsuarioRepository([crear_usuario()])
    ahora = time.time()

    corto = await LoginUsuarioUseCase(repo).ejecutar(
        LoginRequestDTO(email="ana@mail.com", password=PASSWORD_VALIDA)
    )
    largo = await LoginUsuarioUseCase(repo).ejecutar(
        LoginRequestDTO(
            email="ana@mail.com", password=PASSWORD_VALIDA, confiar_dispositivo=True
        )
    )

    exp_corto = verificar_token(corto.access_token)["exp"]
    exp_largo = verificar_token(largo.access_token)["exp"]
    assert exp_corto - ahora <= 31 * 60  # ~30 minutos
    assert exp_largo - ahora > 300 * 24 * 60 * 60  # más de 300 días
