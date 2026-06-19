from dataclasses import dataclass


@dataclass
class ReglaAlerta:
    """Regla que vincula una condición clínica con una emergencia para generar una alerta."""

    id_condicion: int
    id_emergencia: str
    mensaje: str
    severidad: str
    id_regla: int | None = None
