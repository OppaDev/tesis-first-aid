from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.entities.permiso import Permiso
from app.domain.entities.rol import Rol
from app.domain.entities.usuario import Usuario
from app.domain.repositories.usuario_repository import UsuarioRepository
from app.infrastructure.database.models.rol_model import RolModel
from app.infrastructure.database.models.usuario_model import UsuarioModel


class UsuarioRepositoryImpl(UsuarioRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def obtener_por_email(self, email: str) -> Usuario | None:
        result = await self._session.execute(
            select(UsuarioModel)
            .where(UsuarioModel.email == email)
            .options(selectinload(UsuarioModel.rol).selectinload(RolModel.permisos))
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def obtener_por_cedula(self, cedula: str) -> Usuario | None:
        result = await self._session.execute(
            select(UsuarioModel)
            .where(UsuarioModel.cedula == cedula)
            .options(selectinload(UsuarioModel.rol).selectinload(RolModel.permisos))
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def crear(self, usuario: Usuario) -> Usuario:
        model = UsuarioModel(
            cedula=usuario.cedula,
            id_rol=usuario.id_rol,
            nombres=usuario.nombres,
            apellidos=usuario.apellidos,
            fecha_nacimiento=usuario.fecha_nacimiento,
            email=usuario.email,
            password=usuario.password,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_entity(model)

    @staticmethod
    def _to_entity(model: UsuarioModel) -> Usuario:
        return Usuario(
            cedula=model.cedula,
            id_rol=model.id_rol,
            rol=UsuarioRepositoryImpl._rol_to_entity(model.rol),
            nombres=model.nombres,
            apellidos=model.apellidos,
            fecha_nacimiento=model.fecha_nacimiento,
            email=model.email,
            password=model.password,
        )

    @staticmethod
    def _rol_to_entity(model: RolModel | None) -> Rol | None:
        if model is None:
            return None
        return Rol(
            id_rol=model.id_rol,
            nombre_rol=model.nombre_rol,
            descripcion=model.descripcion,
            permisos=[
                Permiso(
                    id_permiso=p.id_permiso,
                    nombre_permiso=p.nombre_permiso,
                    descripcion_permiso=p.descripcion_permiso,
                )
                for p in model.permisos
            ],
        )
