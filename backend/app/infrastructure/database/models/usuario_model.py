from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.database import Base


class UsuarioModel(Base):
    __tablename__ = "usuario"

    cedula: Mapped[str] = mapped_column(String(11), primary_key=True)
    id_rol: Mapped[int | None] = mapped_column(ForeignKey("rol.id_rol"), nullable=True)
    nombres: Mapped[str] = mapped_column(String(255), nullable=False)
    apellidos: Mapped[str] = mapped_column(String(255), nullable=False)
    fecha_nacimiento: Mapped[date] = mapped_column(Date, nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String(300), nullable=False)
    # Versión del token: se incrementa al cerrar sesión para invalidar en el
    # servidor los JWT emitidos previamente (revocación).
    token_version: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0", default=0
    )

    rol: Mapped["RolModel"] = relationship(back_populates="usuarios")
    perfil_clinico: Mapped["PerfilClinicoModel"] = relationship(
        back_populates="usuario", uselist=False
    )
