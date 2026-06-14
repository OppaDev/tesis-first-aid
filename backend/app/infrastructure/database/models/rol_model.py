from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.database import Base


class RolModel(Base):
    __tablename__ = "rol"

    id_rol: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre_rol: Mapped[str] = mapped_column(String(50), nullable=False)
    descripcion: Mapped[str] = mapped_column(String(150), nullable=False)

    usuarios: Mapped[list["UsuarioModel"]] = relationship(back_populates="rol")
    permisos: Mapped[list["PermisoModel"]] = relationship(
        secondary="rol_permiso", back_populates="roles"
    )
