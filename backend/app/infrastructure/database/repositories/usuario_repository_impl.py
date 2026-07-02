from sqlalchemy import func, select
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

    async def listar(self, limit: int, offset: int) -> list[Usuario]:
        result = await self._session.execute(
            select(UsuarioModel)
            .options(selectinload(UsuarioModel.rol).selectinload(RolModel.permisos))
            .order_by(UsuarioModel.cedula)
            .limit(limit)
            .offset(offset)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def contar(self) -> int:
        result = await self._session.execute(
            select(func.count()).select_from(UsuarioModel)
        )
        return result.scalar_one()

    async def actualizar_rol(self, cedula: str, id_rol: int) -> Usuario | None:
        model = await self._session.get(UsuarioModel, cedula)
        if model is None:
            return None
        model.id_rol = id_rol
        await self._session.commit()
        return await self.obtener_por_cedula(cedula)

    async def actualizar_datos(
        self, cedula: str, nombres: str, apellidos: str, email: str
    ) -> Usuario | None:
        model = await self._session.get(UsuarioModel, cedula)
        if model is None:
            return None
        model.nombres = nombres
        model.apellidos = apellidos
        model.email = email
        await self._session.commit()
        return await self.obtener_por_cedula(cedula)

    async def actualizar_password(self, cedula: str, password_hash: str) -> None:
        model = await self._session.get(UsuarioModel, cedula)
        if model is not None:
            model.password = password_hash
            await self._session.commit()

    async def eliminar(self, cedula: str) -> None:
        model = await self._session.get(UsuarioModel, cedula)
        if model is not None:
            await self._session.delete(model)
            await self._session.commit()

    async def incrementar_token_version(self, cedula: str) -> None:
        model = await self._session.get(UsuarioModel, cedula)
        if model is not None:
            model.token_version += 1
            await self._session.commit()

    async def contar_por_rol(self, id_rol: int) -> int:
        result = await self._session.execute(
            select(func.count()).select_from(UsuarioModel).where(UsuarioModel.id_rol == id_rol)
        )
        return result.scalar_one()

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
        # Re-consulta con el rol cargado (selectinload). NO usar _to_entity sobre el
        # modelo recién insertado: acceder a model.rol dispararía un lazy-load en
        # contexto async (MissingGreenlet).
        creado = await self.obtener_por_cedula(usuario.cedula)
        assert creado is not None
        return creado

    @staticmethod
    def _to_entity(model: UsuarioModel) -> Usuario:
        return Usuario(
            cedula=model.cedula,
            id_rol=model.id_rol,
            rol=UsuarioRepositoryImpl._rol_to_entity(model.rol),
            token_version=model.token_version,
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
