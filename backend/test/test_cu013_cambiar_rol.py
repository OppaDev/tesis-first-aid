"""CU-013 Cambiar rol de un usuario — casos CU013-CP001 … CU013-CP004."""

import pytest

from app.application.dtos.usuario_admin_dto import CambiarRolRequestDTO
from app.application.use_cases.cambiar_rol_usuario import CambiarRolUsuarioUseCase
from app.domain.exceptions import ConflictError, NotFoundError
from conftest import (
    CEDULA_VALIDA,
    CEDULA_VALIDA_2,
    CEDULA_VALIDA_3,
    FakeUsuarioRepository,
    crear_usuario,
)

ADMIN = 1
USUARIO = 2


async def test_cu013_cp001_promover_a_administrador():
    """CU013-CP001: promover un usuario común a administrador."""
    repo = FakeUsuarioRepository([
        crear_usuario(cedula=CEDULA_VALIDA, id_rol=USUARIO),
        crear_usuario(cedula=CEDULA_VALIDA_2, email="admin@mail.com", id_rol=ADMIN),
    ])

    resultado = await CambiarRolUsuarioUseCase(repo).ejecutar(
        CEDULA_VALIDA, CambiarRolRequestDTO(id_rol=ADMIN)
    )

    assert resultado.id_rol == ADMIN
    assert repo.usuarios[CEDULA_VALIDA].id_rol == ADMIN


async def test_cu013_cp002_no_degradar_ultimo_admin():
    """CU013-CP002: no se puede quitar el rol al último administrador."""
    repo = FakeUsuarioRepository([
        crear_usuario(cedula=CEDULA_VALIDA_2, email="admin@mail.com", id_rol=ADMIN),
    ])

    with pytest.raises(ConflictError) as exc:
        await CambiarRolUsuarioUseCase(repo).ejecutar(
            CEDULA_VALIDA_2, CambiarRolRequestDTO(id_rol=USUARIO)
        )
    assert str(exc.value) == (
        "No se puede quitar el rol de administrador: "
        "el sistema debe conservar al menos un administrador"
    )
    assert repo.usuarios[CEDULA_VALIDA_2].id_rol == ADMIN


async def test_cu013_cp003_degradar_con_dos_admins():
    """CU013-CP003: con dos administradores sí se permite degradar a uno."""
    repo = FakeUsuarioRepository([
        crear_usuario(cedula=CEDULA_VALIDA_2, email="admin1@mail.com", id_rol=ADMIN),
        crear_usuario(cedula=CEDULA_VALIDA_3, email="admin2@mail.com", id_rol=ADMIN),
    ])

    resultado = await CambiarRolUsuarioUseCase(repo).ejecutar(
        CEDULA_VALIDA_3, CambiarRolRequestDTO(id_rol=USUARIO)
    )

    assert resultado.id_rol == USUARIO
    assert repo.usuarios[CEDULA_VALIDA_2].id_rol == ADMIN  # queda al menos un admin


async def test_cu013_cp004_usuario_inexistente():
    """CU013-CP004: cambiar el rol de una cédula no registrada → recurso no encontrado."""
    with pytest.raises(NotFoundError) as exc:
        await CambiarRolUsuarioUseCase(FakeUsuarioRepository()).ejecutar(
            CEDULA_VALIDA, CambiarRolRequestDTO(id_rol=ADMIN)
        )
    assert str(exc.value) == "El usuario no existe"
