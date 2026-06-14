from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.database import Base


class CondicionModel(Base):
    __tablename__ = "condicion"

    id_condicion: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_categoria: Mapped[int | None] = mapped_column(
        ForeignKey("categoria.id_categoria"), nullable=True
    )
    nombre_condicion: Mapped[str] = mapped_column(String(100), nullable=False)
    descripcion_condicion: Mapped[str] = mapped_column(String(300), nullable=False)

    categoria: Mapped["CategoriaModel"] = relationship(back_populates="condiciones")
    perfiles: Mapped[list["PerfilClinicoModel"]] = relationship(
        secondary="perfil_condicion", back_populates="condiciones"
    )
