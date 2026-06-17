from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.database import Base


class PasoModel(Base):
    __tablename__ = "paso"

    id_paso: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_protocolo: Mapped[str] = mapped_column(
        ForeignKey("protocolo.id_protocolo"), nullable=False, unique=True
    )
    paso_siguiente: Mapped[str | None] = mapped_column(String(10), nullable=True)
    paso_siguiente_no: Mapped[str | None] = mapped_column(String(10), nullable=True)
    anexo_si: Mapped[str | None] = mapped_column(String(10), nullable=True)
    anexo_no: Mapped[str | None] = mapped_column(String(10), nullable=True)

    protocolo: Mapped["ProtocoloModel"] = relationship(back_populates="paso")
