from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.database import Base


class PermisoModel(Base):
    __tablename__ = "permiso"

    id_permiso: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre_permiso: Mapped[str] = mapped_column(String(50), nullable=False)
    descripcion_permiso: Mapped[str] = mapped_column(String(150), nullable=False)

    roles: Mapped[list["RolModel"]] = relationship(
        secondary="rol_permiso", back_populates="permisos"
    )
