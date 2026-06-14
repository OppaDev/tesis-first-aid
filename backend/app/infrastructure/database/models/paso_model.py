from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.database import Base


class PasoModel(Base):
    __tablename__ = "paso"

    id_paso: Mapped[str] = mapped_column(String(10), primary_key=True)
    id_emergencia: Mapped[str | None] = mapped_column(
        ForeignKey("emergencia.id_emergencia"), nullable=True
    )
    numero: Mapped[int] = mapped_column(Integer, nullable=False)
    instruccion: Mapped[str] = mapped_column(Text, nullable=False)
    observacion: Mapped[str | None] = mapped_column(Text, nullable=True)
    imagen: Mapped[str | None] = mapped_column(String(300), nullable=True)
    paso_anterior: Mapped[str | None] = mapped_column(String(10), nullable=True)
    paso_siguiente: Mapped[str | None] = mapped_column(String(10), nullable=True)
    anexo: Mapped[str | None] = mapped_column(String(10), nullable=True)

    emergencia: Mapped["EmergenciaModel"] = relationship(back_populates="pasos")
