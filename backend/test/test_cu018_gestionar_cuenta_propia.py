"""CU-018 Gestionar datos de cuenta propios — casos CU018-CP001 … CU018-CP003."""

import pytest

from app.application.dtos.auth_dto import ActualizarMiCuentaRequestDTO
from app.application.use_cases.actualizar_mi_cuenta import ActualizarMiCuentaUseCase
from app.domain.exceptions import ValidationError
from conftest import CEDULA_VALIDA, CEDULA_VALIDA_2, FakeUsuarioRepository, crear_usuario


async def test_cu018_cp001_actualizar_datos_propios():
    """CU018-CP001: el usuario actualiza sus nombres, apellidos y correo."""
    repo = FakeUsuarioRepository([crear_usuario()])
    dto = ActualizarMiCuentaRequestDTO(
        nombres="Ana María", apellidos="Pérez Vega", email="ana.nueva@mail.com"
    )

    resultado = await ActualizarMiCuentaUseCase(repo).ejecutar(CEDULA_VALIDA, dto)

    assert resultado.nombres == "Ana María"
    assert resultado.apellidos == "Pérez Vega"
    assert resultado.email == "ana.nueva@mail.com"
    assert resultado.cedula == CEDULA_VALIDA  # la cédula no cambia
    guardado = repo.usuarios[CEDULA_VALIDA]
    assert guardado.email == "ana.nueva@mail.com"


async def test_cu018_cp002_email_de_otro_usuario_rechazado():
    """CU018-CP002: no se permite cambiar el correo a uno ya usado por otra cuenta."""
    repo = FakeUsuarioRepository([
        crear_usuario(),
        crear_usuario(cedula=CEDULA_VALIDA_2, email="otro@mail.com"),
    ])
    dto = ActualizarMiCuentaRequestDTO(
        nombres="Ana", apellidos="Pérez", email="otro@mail.com"
    )

    with pytest.raises(ValidationError) as exc:
        await ActualizarMiCuentaUseCase(repo).ejecutar(CEDULA_VALIDA, dto)
    assert str(exc.value) == "Ya existe un usuario con ese email"


async def test_cu018_cp003_conservar_email_propio_permitido():
    """CU018-CP003: mantener el propio correo (sin cambiarlo) no cuenta como duplicado."""
    repo = FakeUsuarioRepository([crear_usuario()])
    dto = ActualizarMiCuentaRequestDTO(
        nombres="Ana Actualizada", apellidos="Pérez", email="ana@mail.com"
    )

    resultado = await ActualizarMiCuentaUseCase(repo).ejecutar(CEDULA_VALIDA, dto)

    assert resultado.nombres == "Ana Actualizada"
    assert resultado.email == "ana@mail.com"
