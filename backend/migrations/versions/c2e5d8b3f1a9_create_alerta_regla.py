"""create alerta_regla table

Revision ID: c2e5d8b3f1a9
Revises: b1f4c9a2e7d3
Create Date: 2026-06-19 10:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'c2e5d8b3f1a9'
down_revision: Union[str, None] = 'b1f4c9a2e7d3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'alerta_regla',
        sa.Column('id_regla', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('id_condicion', sa.Integer(), nullable=False),
        sa.Column('id_emergencia', sa.String(length=10), nullable=False),
        sa.Column('mensaje', sa.Text(), nullable=False),
        sa.Column('severidad', sa.String(length=20), nullable=False),
        sa.ForeignKeyConstraint(['id_condicion'], ['condicion.id_condicion'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['id_emergencia'], ['emergencia.id_emergencia'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id_regla'),
        sa.UniqueConstraint('id_condicion', 'id_emergencia', name='uq_alerta_condicion_emergencia'),
    )
    op.create_index('ix_alerta_regla_id_condicion', 'alerta_regla', ['id_condicion'])
    op.create_index('ix_alerta_regla_id_emergencia', 'alerta_regla', ['id_emergencia'])


def downgrade() -> None:
    op.drop_index('ix_alerta_regla_id_emergencia', table_name='alerta_regla')
    op.drop_index('ix_alerta_regla_id_condicion', table_name='alerta_regla')
    op.drop_table('alerta_regla')
