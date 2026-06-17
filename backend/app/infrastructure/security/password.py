from passlib.context import CryptContext

_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hashear(password: str) -> str:
    return _ctx.hash(password)


def verificar(password: str, hashed: str) -> bool:
    return _ctx.verify(password, hashed)
