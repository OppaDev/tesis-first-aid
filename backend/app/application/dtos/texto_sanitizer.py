import re

# Etiquetas tipo HTML/XML (<script>, <b>, </div>, ...). No se ejecutan en los
# clientes (la API es JSON y React Native no interpreta HTML), pero se eliminan
# para que no queden almacenadas en nombres, mensajes o descripciones.
_ETIQUETAS = re.compile(r"<[^>]*>")

# Caracteres de control (C0 y DEL), salvo el salto de línea, válido en textos largos.
_CONTROL = re.compile(r"[\x00-\x09\x0b-\x1f\x7f]")


def limpiar_texto(valor: str) -> str:
    """Sanitiza texto libre: quita etiquetas tipo HTML y caracteres de control.

    Si el resultado queda vacío cuando el original no lo era (p. ej. solo
    etiquetas), se rechaza: el dato no tiene contenido real.
    """
    limpio = _CONTROL.sub("", _ETIQUETAS.sub("", valor)).strip()
    if valor.strip() and not limpio:
        raise ValueError("El texto no puede componerse solo de etiquetas")
    return limpio
