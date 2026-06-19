from dataclasses import dataclass


@dataclass
class AlertaClinica:
    """Advertencia contextual generada al cruzar una condición del usuario con la emergencia.

    NO altera el protocolo (Regla de Oro): solo se muestra junto a él.
    """

    nombre_condicion: str
    mensaje: str
    severidad: str
    detalle: str | None = None  # detalle personal del usuario sobre la condición
