"""
Seed del catálogo de categorías y condiciones médicas.
Uso: conda run -n tesis python scripts/seed_condiciones.py
"""
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.infrastructure.config import settings
from app.infrastructure.database.models.categoria_model import CategoriaModel
from app.infrastructure.database.models.condicion_model import CondicionModel

# Cada categoría con sus condiciones (nombre, descripción genérica del catálogo)
CATALOGO = {
    "Enfermedades crónicas": [
        ("Diabetes", "Enfermedad crónica que afecta el nivel de glucosa en sangre."),
        ("Hipertensión arterial", "Presión arterial elevada de forma sostenida."),
        ("Asma", "Enfermedad respiratoria crónica que dificulta la respiración."),
        ("Epilepsia", "Trastorno neurológico que provoca convulsiones recurrentes."),
        ("Enfermedad cardíaca", "Afección del corazón o de los vasos sanguíneos."),
    ],
    "Alergias": [
        ("Alergia a medicamentos", "Reacción alérgica a uno o más fármacos."),
        ("Alergia alimentaria", "Reacción alérgica a determinados alimentos."),
        ("Alergia a picaduras de insectos", "Reacción alérgica a picaduras de insectos."),
    ],
    "Condiciones especiales": [
        ("Embarazo", "Estado de gestación que requiere consideraciones especiales."),
        ("Uso de marcapasos", "Portador de un dispositivo marcapasos cardíaco."),
        ("Uso de anticoagulantes", "Tratamiento con medicamentos que dificultan la coagulación."),
        ("Hemofilia", "Trastorno de la coagulación que provoca sangrado prolongado."),
    ],
    "Movilidad y discapacidad": [
        ("Movilidad reducida", "Limitación para desplazarse de forma autónoma."),
        ("Discapacidad auditiva", "Pérdida total o parcial de la audición."),
        ("Discapacidad visual", "Pérdida total o parcial de la visión."),
    ],
}


async def seed():
    engine = create_async_engine(settings.database_url)
    SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with SessionLocal() as session:
        for nombre_categoria, condiciones in CATALOGO.items():
            categoria = await _obtener_o_crear_categoria(session, nombre_categoria)
            for nombre_condicion, descripcion in condiciones:
                existe = await session.execute(
                    select(CondicionModel).where(
                        CondicionModel.nombre_condicion == nombre_condicion
                    )
                )
                if not existe.scalar_one_or_none():
                    session.add(
                        CondicionModel(
                            id_categoria=categoria.id_categoria,
                            nombre_condicion=nombre_condicion,
                            descripcion_condicion=descripcion,
                        )
                    )
        await session.commit()
        print("Catálogo de condiciones insertado correctamente.")

    await engine.dispose()


async def _obtener_o_crear_categoria(session: AsyncSession, nombre: str) -> CategoriaModel:
    result = await session.execute(
        select(CategoriaModel).where(CategoriaModel.nombre_categoria == nombre)
    )
    categoria = result.scalar_one_or_none()
    if categoria is None:
        categoria = CategoriaModel(nombre_categoria=nombre)
        session.add(categoria)
        await session.flush()
    return categoria


asyncio.run(seed())
