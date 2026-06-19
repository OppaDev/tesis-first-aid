from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.database import Base


class PerfilClinicoModel(Base):
    __tablename__ = "perfil_clinico"

    id_perfil: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    cedula: Mapped[str] = mapped_column(
        ForeignKey("usuario.cedula"), unique=True, nullable=False
    )
    genero: Mapped[str] = mapped_column(String(12), nullable=False)
    tipo_sangre: Mapped[str] = mapped_column(String(12), nullable=False)
    altura_cm: Mapped[float] = mapped_column(Float, nullable=False)
    peso_kg: Mapped[float] = mapped_column(Float, nullable=False)

    usuario: Mapped["UsuarioModel"] = relationship(back_populates="perfil_clinico")
    condiciones: Mapped[list["PerfilCondicionModel"]] = relationship(
        back_populates="perfil", cascade="all, delete-orphan"
    )
