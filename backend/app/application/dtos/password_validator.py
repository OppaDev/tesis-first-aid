import re

# Política de contraseñas: mínimo 8 caracteres, al menos una mayúscula,
# una minúscula y un carácter especial. Reutilizable en cualquier DTO.
LONGITUD_MINIMA = 8


def validar_password(valor: str) -> str:
    if len(valor) < LONGITUD_MINIMA:
        raise ValueError("La contraseña debe tener al menos 8 caracteres")
    if not re.search(r"[A-Z]", valor):
        raise ValueError("La contraseña debe incluir al menos una mayúscula")
    if not re.search(r"[a-z]", valor):
        raise ValueError("La contraseña debe incluir al menos una minúscula")
    if not re.search(r"[^A-Za-z0-9]", valor):
        raise ValueError("La contraseña debe incluir al menos un carácter especial")
    return valor
