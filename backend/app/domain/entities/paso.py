from dataclasses import dataclass


@dataclass
class Paso:
    id_protocolo: str
    paso_siguiente: str | None = None
    paso_siguiente_no: str | None = None
    anexo_si: str | None = None
    anexo_no: str | None = None
