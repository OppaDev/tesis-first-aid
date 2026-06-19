from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.database import Base


class PerfilCondicionModel(Base):
    __tablename__ = "perfil_condicion"

    id_perfil: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("perfil_clinico.id_perfil", ondelete="CASCADE"),
        primary_key=True,
    )
    id_condicion: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("condicion.id_condicion", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    )
    detalle: Mapped[str | None] = mapped_column(Text, nullable=True)

    perfil: Mapped["PerfilClinicoModel"] = relationship(back_populates="condiciones")
    condicion: Mapped["CondicionModel"] = relationship(back_populates="perfiles")
