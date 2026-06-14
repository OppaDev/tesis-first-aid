class DomainError(Exception):
    """Error base para todas las violaciones de reglas del dominio."""


class ValidationError(DomainError):
    """Se lanza cuando una entidad recibe datos que violan sus invariantes."""
