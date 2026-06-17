"""protocolo_and_paso_nav

Revision ID: 5ad4b95b05cf
Revises: da001b5a7a16
Create Date: 2026-06-15 02:19:32.413088

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = '5ad4b95b05cf'
down_revision: Union[str, None] = 'da001b5a7a16'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Eliminar tabla paso anterior (contenía contenido + navegación mezclados)
    op.drop_table('paso')

    # Crear tabla protocolo (contenido de cada instrucción/condición)
    op.create_table(
        'protocolo',
        sa.Column('id_protocolo', sa.String(10), primary_key=True),
        sa.Column('id_emergencia', sa.String(10), sa.ForeignKey('emergencia.id_emergencia'), nullable=True),
        sa.Column('numero', sa.Integer, nullable=False),
        sa.Column('instruccion', sa.Text, nullable=False),
        sa.Column('observacion', sa.Text, nullable=True),
        sa.Column('imagen', sa.String(300), nullable=True),
    )

    # Crear tabla paso (navegación/transiciones entre protocolos)
    op.create_table(
        'paso',
        sa.Column('id_paso', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('id_protocolo', sa.String(10), sa.ForeignKey('protocolo.id_protocolo'), nullable=False),
        sa.Column('condicion', sa.String(20), nullable=True),
        sa.Column('id_siguiente', sa.String(10), sa.ForeignKey('protocolo.id_protocolo'), nullable=True),
        sa.Column('id_anexo', sa.String(10), sa.ForeignKey('protocolo.id_protocolo'), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('paso')
    op.drop_table('protocolo')

    op.create_table(
        'paso',
        sa.Column('id_paso', sa.String(10), primary_key=True),
        sa.Column('id_emergencia', sa.String(10), sa.ForeignKey('emergencia.id_emergencia'), nullable=True),
        sa.Column('numero', sa.Integer, nullable=False),
        sa.Column('instruccion', sa.Text, nullable=False),
        sa.Column('observacion', sa.Text, nullable=True),
        sa.Column('imagen', sa.String(300), nullable=True),
        sa.Column('paso_anterior', sa.String(50), nullable=True),
        sa.Column('paso_siguiente', sa.String(10), nullable=True),
        sa.Column('paso_siguiente_no', sa.String(10), nullable=True),
        sa.Column('tipo_paso', sa.String(10), nullable=False, server_default='normal'),
        sa.Column('anexo', sa.String(100), nullable=True),
    )
