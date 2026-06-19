def _longitud_valida(cedula: str) -> bool:
    return cedula.isdigit() and len(cedula) == 10


def _provincia_valida(cedula: str) -> bool:
    return 1 <= int(cedula[0:2]) <= 24


def _tercer_digito_valido(cedula: str) -> bool:
    return int(cedula[2]) <= 5


def _digito_verificador_valido(cedula: str) -> bool:
    coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
    suma = sum(
        (d * c - 9 if d * c > 9 else d * c)
        for d, c in zip((int(x) for x in cedula[:9]), coeficientes)
    )
    verificador = (10 - suma % 10) % 10
    return verificador == int(cedula[9])


def validar_cedula_ecuatoriana(cedula: str) -> bool:
    if not _longitud_valida(cedula):
        return False
    return (
        _provincia_valida(cedula)
        and _tercer_digito_valido(cedula)
        and _digito_verificador_valido(cedula)
    )
