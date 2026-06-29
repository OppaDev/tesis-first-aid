from app.domain.repositories.usuario_repository import UsuarioRepository


class CerrarSesionUsuarioUseCase:
    """Invalida en el servidor los JWT vigentes del usuario incrementando su
    token_version (revocación). Los tokens emitidos antes dejan de ser válidos."""

    def __init__(self, repo: UsuarioRepository) -> None:
        self._repo = repo

    async def ejecutar(self, cedula: str) -> None:
        await self._repo.incrementar_token_version(cedula)
