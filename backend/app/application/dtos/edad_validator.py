from datetime import date

EDAD_MINIMA = 18


def validar_mayor_de_edad(fecha_nacimiento: date) -> date:
    """Valida que la persona tenga al menos 18 años cumplidos a la fecha de hoy.

    Se usa en los DTOs de registro y de creación de usuarios (no en la entidad:
    la entidad se reconstruye al leer la base y esto invalidaría cuentas ya
    existentes si la política cambiara).
    """
    hoy = date.today()
    edad = hoy.year - fecha_nacimiento.year - (
        (hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day)
    )
    if edad < EDAD_MINIMA:
        raise ValueError("El usuario debe tener al menos 18 años")
    return fecha_nacimiento
