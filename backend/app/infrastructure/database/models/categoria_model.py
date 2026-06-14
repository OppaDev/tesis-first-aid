from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.database import Base


class CategoriaModel(Base):
    __tablename__ = "categoria"

    id_categoria: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre_categoria: Mapped[str] = mapped_column(String(100), nullable=False)

    condiciones: Mapped[list["CondicionModel"]] = relationship(back_populates="categoria")
