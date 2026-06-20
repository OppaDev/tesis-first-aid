"""
Seed inicial de roles, permisos y su asignación (rol_permiso).
Idempotente: puede ejecutarse varias veces sin duplicar.
Uso: conda run -n tesis python scripts/seed_roles.py
"""
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.infrastructure.config import settings
from app.infrastructure.database.models.associations import rol_permiso
from app.infrastructure.database.models.permiso_model import PermisoModel
from app.infrastructure.database.models.rol_model import RolModel

ROLES = [
    {"id_rol": 1, "nombre_rol": "administrador", "descripcion": "Gestión de usuarios y configuración del sistema"},
    {"id_rol": 2, "nombre_rol": "usuario",        "descripcion": "Acceso a consultas y perfil clínico personal"},
]

PERMISOS = [
    {"id_permiso": 1, "nombre_permiso": "gestionar_reglas",   "descripcion_permiso": "Crear, editar y eliminar reglas del motor de alertas"},
    {"id_permiso": 2, "nombre_permiso": "gestionar_catalogo", "descripcion_permiso": "Administrar categorías y condiciones del catálogo"},
    {"id_permiso": 3, "nombre_permiso": "gestionar_usuarios", "descripcion_permiso": "Administrar usuarios y roles"},
]

# id_rol -> lista de id_permiso
ROL_PERMISOS = {
    1: [1, 2, 3],  # administrador: todos
    2: [],         # usuario: ninguno (usa perfil/consulta, protegidos solo por autenticación)
}


async def seed():
    engine = create_async_engine(settings.database_url)
    SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with SessionLocal() as session:
        for rol_data in ROLES:
            existe = await session.execute(
                select(RolModel).where(RolModel.id_rol == rol_data["id_rol"])
            )
            if not existe.scalar_one_or_none():
                session.add(RolModel(**rol_data))

        for permiso_data in PERMISOS:
            existe = await session.execute(
                select(PermisoModel).where(PermisoModel.id_permiso == permiso_data["id_permiso"])
            )
            if not existe.scalar_one_or_none():
                session.add(PermisoModel(**permiso_data))

        await session.flush()

        for id_rol, ids_permiso in ROL_PERMISOS.items():
            for id_permiso in ids_permiso:
                existe = await session.execute(
                    select(rol_permiso).where(
                        rol_permiso.c.id_rol == id_rol,
                        rol_permiso.c.id_permiso == id_permiso,
                    )
                )
                if not existe.first():
                    await session.execute(
                        rol_permiso.insert().values(id_rol=id_rol, id_permiso=id_permiso)
                    )

        await session.commit()
        print("Roles, permisos y asignaciones insertados correctamente.")

    await engine.dispose()


asyncio.run(seed())
