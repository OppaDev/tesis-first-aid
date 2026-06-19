from app.domain.entities.alerta_clinica import AlertaClinica
from app.domain.entities.condicion import Condicion
from app.domain.entities.regla_alerta import ReglaAlerta

# Orden de prioridad para mostrar las alertas más graves primero.
_ORDEN_SEVERIDAD = {"critica": 0, "alta": 1, "media": 2, "baja": 3}


class RecomendacionService:
    """Cruza las condiciones del perfil con las reglas de la emergencia (Regla de Oro:
    nunca modifica el protocolo, solo genera alertas contextuales)."""

    def generar_alertas(
        self,
        condiciones_usuario: list[Condicion],
        reglas: list[ReglaAlerta],
    ) -> list[AlertaClinica]:
        reglas_por_condicion = {r.id_condicion: r for r in reglas}

        alertas = [
            AlertaClinica(
                nombre_condicion=condicion.nombre_condicion,
                mensaje=reglas_por_condicion[condicion.id_condicion].mensaje,
                severidad=reglas_por_condicion[condicion.id_condicion].severidad,
                detalle=condicion.detalle,
            )
            for condicion in condiciones_usuario
            if condicion.id_condicion in reglas_por_condicion
        ]

        return sorted(alertas, key=lambda a: _ORDEN_SEVERIDAD.get(a.severidad, 99))
