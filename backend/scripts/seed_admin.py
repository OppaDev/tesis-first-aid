"""
Seed de un usuario administrador inicial.
Idempotente: si ya existe (por cédula) asegura que tenga rol administrador.
Requiere haber corrido antes seed_roles.py (rol administrador = id 1).

Edita el diccionario ADMIN con los datos reales. Cambia la contraseña tras el primer login.
Uso: conda run -n tesis python scripts/seed_admin.py
"""
import asyncio
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.infrastructure.config import settings
from app.infrastructure.database.models.usuario_model import UsuarioModel
from app.infrastructure.security.password import hashear

ID_ROL_ADMIN = 1

ADMIN = {
    "cedula": "0402084040",
    "nombres": "Jefferson Leonardo",
    "apellidos": "Obando Carlosma",
    "fecha_nacimiento": date(1999, 5, 17),
    "email": "admin@sanfra.com",
    "password": "admin123",  # cámbiala tras el primer login
}


async def seed():
    engine = create_async_engine(settings.database_url)
    SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with SessionLocal() as session:
        result = await session.execute(
            select(UsuarioModel).where(UsuarioModel.cedula == ADMIN["cedula"])
        )
        usuario = result.scalar_one_or_none()

        if usuario is not None:
            usuario.id_rol = ID_ROL_ADMIN
            print(f"Usuario {ADMIN['cedula']} ya existía → asegurado como administrador.")
        else:
            session.add(
                UsuarioModel(
                    cedula=ADMIN["cedula"],
                    id_rol=ID_ROL_ADMIN,
                    nombres=ADMIN["nombres"],
                    apellidos=ADMIN["apellidos"],
                    fecha_nacimiento=ADMIN["fecha_nacimiento"],
                    email=ADMIN["email"],
                    password=hashear(ADMIN["password"]),
                )
            )
            print(f"Administrador creado: {ADMIN['email']} (cédula {ADMIN['cedula']})")

        await session.commit()

    await engine.dispose()


asyncio.run(seed())
