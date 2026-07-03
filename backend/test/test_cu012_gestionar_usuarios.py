"""CU-012 Gestionar usuarios (administración) — casos CU012-CP001 … CU012-CP004."""

import pytest

from app.application.use_cases.eliminar_usuario_admin import EliminarUsuarioAdminUseCase
from app.domain.exceptions import ConflictError, NotFoundError
from conftest import (
    CEDULA_VALIDA,
    CEDULA_VALIDA_2,
    FakePerfilClinicoRepository,
    FakeUsuarioRepository,
    crear_perfil,
    crear_usuario,
)

ADMIN = 1
USUARIO = 2


async def test_cu012_cp001_eliminacion_valida_perfil_primero():
    """CU012-CP001: eliminación válida borra primero el perfil clínico y luego el usuario."""
    usuario_repo = FakeUsuarioRepository([
        crear_usuario(cedula=CEDULA_VALIDA, id_rol=USUARIO),
        crear_usuario(cedula=CEDULA_VALIDA_2, email="admin@mail.com", id_rol=ADMIN),
    ])
    perfil_repo = FakePerfilClinicoRepository([crear_perfil(cedula=CEDULA_VALIDA)])
    orden: list[str] = []
    usuario_repo.orden_llamadas = orden
    perfil_repo.orden_llamadas = orden

    await EliminarUsuarioAdminUseCase(usuario_repo, perfil_repo).ejecutar(
        CEDULA_VALIDA, cedula_actual=CEDULA_VALIDA_2
    )

    assert orden == ["perfil", "usuario"]  # sin ON DELETE CASCADE, el perfil va primero
    assert CEDULA_VALIDA not in usuario_repo.usuarios
    assert CEDULA_VALIDA not in perfil_repo.perfiles


async def test_cu012_cp002_no_eliminar_propia_cuenta():
    """CU012-CP002: el administrador no puede eliminar su propia cuenta."""
    usuario_repo = FakeUsuarioRepository([
        crear_usuario(cedula=CEDULA_VALIDA_2, email="admin@mail.com", id_rol=ADMIN),
    ])

    with pytest.raises(ConflictError) as exc:
        await EliminarUsuarioAdminUseCase(usuario_repo, FakePerfilClinicoRepository()).ejecutar(
            CEDULA_VALIDA_2, cedula_actual=CEDULA_VALIDA_2
        )
    assert str(exc.value) == "No puedes eliminar tu propia cuenta"
    assert CEDULA_VALIDA_2 in usuario_repo.usuarios


async def test_cu012_cp003_no_eliminar_ultimo_admin():
    """CU012-CP003: no se puede eliminar al último administrador del sistema."""
    usuario_repo = FakeUsuarioRepository([
        crear_usuario(cedula=CEDULA_VALIDA, id_rol=ADMIN),  # único admin
    ])

    with pytest.raises(ConflictError) as exc:
        await EliminarUsuarioAdminUseCase(usuario_repo, FakePerfilClinicoRepository()).ejecutar(
            CEDULA_VALIDA, cedula_actual=CEDULA_VALIDA_2  # otro admin ficticio ejecuta
        )
    assert str(exc.value) == "No se puede eliminar el último administrador del sistema"
    assert CEDULA_VALIDA in usuario_repo.usuarios


async def test_cu012_cp004_usuario_inexistente():
    """CU012-CP004: eliminar una cédula no registrada → recurso no encontrado."""
    with pytest.raises(NotFoundError) as exc:
        await EliminarUsuarioAdminUseCase(
            FakeUsuarioRepository(), FakePerfilClinicoRepository()
        ).ejecutar(CEDULA_VALIDA, cedula_actual=CEDULA_VALIDA_2)
    assert str(exc.value) == "El usuario no existe"
