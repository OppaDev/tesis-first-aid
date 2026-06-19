"""
Seed de reglas de alerta clínica (cruce condición x emergencia).

CONJUNTO INICIAL CONSERVADOR — debe ser revisado y validado por un experto
clínico. El objetivo del diseño es que estas reglas sean auditables y editables
sin tocar código (Regla de Oro: las alertas NO modifican el protocolo).

severidad: "critica" | "alta" | "media"
Uso: conda run -n tesis python scripts/seed_alertas.py
"""
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.infrastructure.config import settings
from app.infrastructure.database.models.alerta_regla_model import AlertaReglaModel
from app.infrastructure.database.models.condicion_model import CondicionModel

# (nombre_condicion, id_emergencia, severidad, mensaje)
REGLAS = [
    # --- Anticoagulantes ---
    ("Uso de anticoagulantes", "E0001", "alta",
     "La persona toma anticoagulantes: el sangrado puede ser más abundante y difícil de detener. Aplicar presión firme y sostenida y buscar ayuda médica con urgencia."),
    ("Uso de anticoagulantes", "E0008", "critica",
     "Anticoagulantes + golpe en la cabeza: alto riesgo de hemorragia interna. Buscar atención médica inmediata aunque no haya síntomas."),
    ("Uso de anticoagulantes", "E0003", "media",
     "Anticoagulantes: mayor riesgo de hematoma o sangrado interno en la zona de la fractura. Vigilar hinchazón."),
    ("Uso de anticoagulantes", "E0012", "alta",
     "Anticoagulantes: el sangrado por la mordedura puede ser mayor. Presión continua y atención médica."),
    # --- Hemofilia ---
    ("Hemofilia", "E0001", "critica",
     "Hemofilia: el sangrado no se detiene con facilidad. Mantener presión continua y buscar atención médica urgente."),
    ("Hemofilia", "E0008", "critica",
     "Hemofilia + golpe en la cabeza: riesgo grave de hemorragia. Emergencia médica inmediata."),
    ("Hemofilia", "E0003", "alta",
     "Hemofilia: riesgo de sangrado interno en la fractura. Atención médica urgente."),
    # --- Diabetes ---
    ("Diabetes", "E0006", "alta",
     "En personas con diabetes, el desmayo puede deberse a hipoglucemia. Si está consciente, dar azúcar; vigilar de cerca."),
    ("Diabetes", "E0004", "alta",
     "En diabéticos, una convulsión puede deberse a hipoglucemia severa. Buscar ayuda médica urgente."),
    ("Diabetes", "E0001", "media",
     "Diabetes: las heridas cicatrizan peor y se infectan más fácilmente. Limpiar bien y vigilar signos de infección."),
    # --- Epilepsia ---
    ("Epilepsia", "E0004", "alta",
     "Antecedente de epilepsia: si la convulsión dura más de 5 minutos o se repite, es una emergencia. Proteger de golpes y no sujetar a la persona."),
    ("Epilepsia", "E0008", "media",
     "Epilepsia: un golpe en la cabeza puede desencadenar convulsiones. Vigilar a la persona."),
    # --- Asma ---
    ("Asma", "E0005", "alta",
     "Asma: el broncoespasmo puede agravar la asfixia. Si tiene inhalador, usarlo; buscar ayuda urgente."),
    ("Asma", "E0007", "alta",
     "Asma + reacción alérgica: mayor riesgo de crisis respiratoria grave. Vigilar la respiración, usar inhalador y buscar ayuda."),
    # --- Enfermedad cardíaca ---
    ("Enfermedad cardíaca", "E0009", "critica",
     "Antecedente cardíaco: mayor riesgo. Activar servicios de emergencia de inmediato y tener a mano su medicación."),
    ("Enfermedad cardíaca", "E0006", "alta",
     "Antecedente cardíaco: el desmayo puede ser de origen cardíaco. Buscar atención médica."),
    # --- Hipertensión ---
    ("Hipertensión arterial", "E0009", "alta",
     "Hipertensión: factor de riesgo cardiovascular. Mantener a la persona en reposo y activar emergencias."),
    # --- Marcapasos ---
    ("Uso de marcapasos", "E0009", "alta",
     "Portador de marcapasos: informar al personal médico. Si se usa un DEA, no colocar el parche directamente sobre el marcapasos."),
    # --- Alergias ---
    ("Alergia a medicamentos", "E0007", "media",
     "Alergia a medicamentos conocida: informar al personal médico qué fármacos debe evitar."),
    ("Alergia alimentaria", "E0007", "alta",
     "Alergia alimentaria: si hay signos de anafilaxia y tiene autoinyector de adrenalina, usarlo. Emergencia."),
    ("Alergia a picaduras de insectos", "E0013", "critica",
     "Alergia a picaduras: alto riesgo de anafilaxia. Vigilar respiración e hinchazón; si tiene autoinyector, usarlo. Emergencia."),
    ("Alergia a picaduras de insectos", "E0007", "alta",
     "Alergia a picaduras conocida: vigilar signos de anafilaxia y usar autoinyector si lo tiene."),
    # --- Embarazo ---
    ("Embarazo", "E0006", "media",
     "Embarazo: acostar a la persona sobre el lado izquierdo para mejorar el flujo sanguíneo. Vigilar y buscar atención."),
    ("Embarazo", "E0009", "alta",
     "Embarazo: las maniobras de RCP requieren consideraciones especiales. Activar emergencias e informar el embarazo."),
    ("Embarazo", "E0004", "critica",
     "Embarazo + convulsión: posible eclampsia, una emergencia obstétrica. Atención médica inmediata."),
]


async def seed():
    engine = create_async_engine(settings.database_url)
    SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with SessionLocal() as session:
        # Mapa nombre_condicion -> id_condicion
        result = await session.execute(select(CondicionModel))
        ids_por_nombre = {c.nombre_condicion: c.id_condicion for c in result.scalars().all()}

        insertadas = 0
        omitidas = 0
        for nombre_condicion, id_emergencia, severidad, mensaje in REGLAS:
            id_condicion = ids_por_nombre.get(nombre_condicion)
            if id_condicion is None:
                print(f"  [AVISO] condición no encontrada en catálogo: {nombre_condicion}")
                continue

            existe = await session.execute(
                select(AlertaReglaModel).where(
                    AlertaReglaModel.id_condicion == id_condicion,
                    AlertaReglaModel.id_emergencia == id_emergencia,
                )
            )
            if existe.scalar_one_or_none():
                omitidas += 1
                continue

            session.add(
                AlertaReglaModel(
                    id_condicion=id_condicion,
                    id_emergencia=id_emergencia,
                    mensaje=mensaje,
                    severidad=severidad,
                )
            )
            insertadas += 1

        await session.commit()
        print(f"Reglas de alerta: {insertadas} insertadas, {omitidas} ya existían.")

    await engine.dispose()


asyncio.run(seed())
