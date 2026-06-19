from sqlalchemy import ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.database import Base


class AlertaReglaModel(Base):
    __tablename__ = "alerta_regla"
    __table_args__ = (
        UniqueConstraint("id_condicion", "id_emergencia", name="uq_alerta_condicion_emergencia"),
    )

    id_regla: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_condicion: Mapped[int] = mapped_column(
        ForeignKey("condicion.id_condicion", ondelete="CASCADE"), nullable=False, index=True
    )
    id_emergencia: Mapped[str] = mapped_column(
        ForeignKey("emergencia.id_emergencia", ondelete="CASCADE"), nullable=False, index=True
    )
    mensaje: Mapped[str] = mapped_column(Text, nullable=False)
    severidad: Mapped[str] = mapped_column(String(20), nullable=False)
