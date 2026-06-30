from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.entities.emergencia import Emergencia
from app.domain.entities.paso import Paso
from app.domain.entities.protocolo import Protocolo
from app.domain.repositories.emergencia_repository import EmergenciaRepository
from app.infrastructure.database.models.emergencia_model import EmergenciaModel
from app.infrastructure.database.models.protocolo_model import ProtocoloModel


class EmergenciaRepositoryImpl(EmergenciaRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def obtener_por_nombre(self, nombre_emergencia: str) -> Emergencia | None:
        result = await self._session.execute(
            select(EmergenciaModel)
            .where(EmergenciaModel.nombre_emergencia == nombre_emergencia)
            .options(
                selectinload(EmergenciaModel.protocolos).selectinload(ProtocoloModel.paso)
            )
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        emergencia = self._to_entity(model)
        # Los anexos (RCP, Heimlich, torniquete…) tienen otro id_emergencia (o NULL),
        # por eso no vienen en model.protocolos. Se incluye todo el flujo alcanzable
        # para que el front pueda mostrarlos y navegar dentro de ellos.
        await self._incluir_alcanzables(emergencia)
        return emergencia

    async def _incluir_alcanzables(self, emergencia: Emergencia) -> None:
        presentes = {p.id_protocolo for p in emergencia.protocolos}
        pendientes = self._referencias(emergencia.protocolos) - presentes
        while pendientes:
            result = await self._session.execute(
                select(ProtocoloModel)
                .where(ProtocoloModel.id_protocolo.in_(pendientes))
                .options(selectinload(ProtocoloModel.paso))
            )
            nuevos = [self._protocolo_from_model(pm) for pm in result.scalars().all()]
            for prot in nuevos:
                if prot.id_protocolo not in presentes:
                    emergencia.protocolos.append(prot)
                    presentes.add(prot.id_protocolo)
            pendientes = self._referencias(nuevos) - presentes

    @staticmethod
    def _referencias(protocolos: list[Protocolo]) -> set[str]:
        refs: set[str] = set()
        for p in protocolos:
            if p.paso is None:
                continue
            for r in (
                p.paso.paso_siguiente,
                p.paso.paso_siguiente_no,
                p.paso.anexo_si,
                p.paso.anexo_no,
            ):
                if r and r != "NULL":
                    refs.add(r)
        return refs

    async def listar(self) -> list[Emergencia]:
        result = await self._session.execute(
            select(EmergenciaModel).order_by(EmergenciaModel.id_emergencia)
        )
        return [
            Emergencia(
                id_emergencia=m.id_emergencia,
                nombre_emergencia=m.nombre_emergencia,
                descripcion_emergencia=m.descripcion_emergencia,
                grupo_edad=m.grupo_edad,
                severidad=m.severidad,
                etiqueta=m.etiqueta,
                evaluacion_inicial=m.evaluacion_inicial,
            )
            for m in result.scalars().all()
        ]

    @staticmethod
    def _to_entity(model: EmergenciaModel) -> Emergencia:
        emergencia = Emergencia(
            id_emergencia=model.id_emergencia,
            nombre_emergencia=model.nombre_emergencia,
            descripcion_emergencia=model.descripcion_emergencia,
            grupo_edad=model.grupo_edad,
            severidad=model.severidad,
            etiqueta=model.etiqueta,
            evaluacion_inicial=model.evaluacion_inicial,
        )
        # Los protocolos propios de la emergencia se insertan primero: así, al
        # ordenar por número, el paso inicial (número 1) queda en la posición 0
        # aunque luego se agreguen anexos con su propia numeración.
        for pm in model.protocolos:
            emergencia.protocolos.append(
                EmergenciaRepositoryImpl._protocolo_from_model(pm)
            )
        return emergencia

    @staticmethod
    def _protocolo_from_model(pm: ProtocoloModel) -> Protocolo:
        paso = None
        if pm.paso is not None:
            paso = Paso(
                id_protocolo=pm.paso.id_protocolo,
                paso_siguiente=pm.paso.paso_siguiente,
                paso_siguiente_no=pm.paso.paso_siguiente_no,
                anexo_si=pm.paso.anexo_si,
                anexo_no=pm.paso.anexo_no,
            )
        return Protocolo(
            id_protocolo=pm.id_protocolo,
            numero=pm.numero,
            instruccion=pm.instruccion,
            observacion=pm.observacion,
            imagen=pm.imagen,
            id_emergencia=pm.id_emergencia,
            paso=paso,
        )
