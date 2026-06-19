from app.domain.exceptions import NotFoundError
from app.domain.repositories.perfil_clinico_repository import PerfilClinicoRepository


class EliminarPerfilClinicoUseCase:
    def __init__(self, repo: PerfilClinicoRepository) -> None:
        self._repo = repo

    async def ejecutar(self, cedula: str) -> None:
        existente = await self._repo.obtener_por_cedula(cedula)
        if existente is None:
            raise NotFoundError("El usuario no tiene un perfil clínico registrado")
        await self._repo.eliminar(cedula)
