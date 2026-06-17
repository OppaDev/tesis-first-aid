"""
Seed inicial de roles.
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
from app.infrastructure.database.models.rol_model import RolModel

ROLES = [
    {"id_rol": 1, "nombre_rol": "administrador", "descripcion": "Gestión de usuarios y configuración del sistema"},
    {"id_rol": 2, "nombre_rol": "usuario",        "descripcion": "Acceso a consultas y perfil clínico personal"},
]


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
        await session.commit()
        print("Roles insertados correctamente.")

    await engine.dispose()


asyncio.run(seed())
