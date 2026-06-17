from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.database import Base


class EmergenciaModel(Base):
    __tablename__ = "emergencia"

    id_emergencia: Mapped[str] = mapped_column(String(10), primary_key=True)
    nombre_emergencia: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    descripcion_emergencia: Mapped[str] = mapped_column(Text, nullable=False)
    grupo_edad: Mapped[str] = mapped_column(String(100), nullable=False)
    severidad: Mapped[str] = mapped_column(String(20), nullable=False)
    etiqueta: Mapped[str] = mapped_column(String(50), nullable=False)
    evaluacion_inicial: Mapped[str] = mapped_column(String(10), nullable=False)

    protocolos: Mapped[list["ProtocoloModel"]] = relationship(
        back_populates="emergencia", order_by="ProtocoloModel.numero"
    )
