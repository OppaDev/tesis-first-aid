from sqlalchemy import Column, ForeignKey, Integer, Table

from app.infrastructure.database.database import Base

rol_permiso = Table(
    "rol_permiso",
    Base.metadata,
    Column("id_rol", Integer, ForeignKey("rol.id_rol"), primary_key=True),
    Column("id_permiso", Integer, ForeignKey("permiso.id_permiso"), primary_key=True),
)
