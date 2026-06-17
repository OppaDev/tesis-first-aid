from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.database import Base


class ProtocoloModel(Base):
    __tablename__ = "protocolo"

    id_protocolo: Mapped[str] = mapped_column(String(10), primary_key=True)
    id_emergencia: Mapped[str | None] = mapped_column(
        ForeignKey("emergencia.id_emergencia"), nullable=True
    )
    numero: Mapped[int] = mapped_column(Integer, nullable=False)
    instruccion: Mapped[str] = mapped_column(Text, nullable=False)
    observacion: Mapped[str | None] = mapped_column(Text, nullable=True)
    imagen: Mapped[str | None] = mapped_column(String(300), nullable=True)

    emergencia: Mapped["EmergenciaModel"] = relationship(back_populates="protocolos")
    paso: Mapped["PasoModel"] = relationship(back_populates="protocolo", uselist=False)
