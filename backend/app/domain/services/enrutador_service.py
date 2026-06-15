import re
from enum import Enum


class TipoConsulta(str, Enum):
    PREGUNTA = "pregunta"
    NARRATIVA = "narrativa"


_PATRON_PREGUNTA = re.compile(
    r"^(¿|qué|que|cómo|como|cuándo|cuando|dónde|donde|cuál|cual|quién|quien|por qué|por que)\b",
    re.IGNORECASE,
)


class EnrutadorService:
    def enrutar(self, texto: str) -> TipoConsulta:
        texto_limpio = texto.strip()
        if _PATRON_PREGUNTA.match(texto_limpio) or texto_limpio.endswith("?"):
            return TipoConsulta.PREGUNTA
        return TipoConsulta.NARRATIVA
