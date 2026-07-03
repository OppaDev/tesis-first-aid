"""CU-003 Cerrar sesión — caso CU003-CP001."""

from app.application.use_cases.cerrar_sesion_usuario import CerrarSesionUsuarioUseCase
from conftest import CEDULA_VALIDA, FakeUsuarioRepository, crear_usuario


async def test_cu003_cp001_logout_incrementa_version_de_sesion():
    """CU003-CP001: el logout incrementa token_version → tokens previos revocados."""
    repo = FakeUsuarioRepository([crear_usuario(token_version=0)])

    await CerrarSesionUsuarioUseCase(repo).ejecutar(CEDULA_VALIDA)

    assert repo.usuarios[CEDULA_VALIDA].token_version == 1
