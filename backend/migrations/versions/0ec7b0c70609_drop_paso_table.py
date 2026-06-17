"""drop_paso_table

Revision ID: 0ec7b0c70609
Revises: 5ad4b95b05cf
Create Date: 2026-06-16 22:52:30.462706

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = '0ec7b0c70609'
down_revision: Union[str, None] = '5ad4b95b05cf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_table('paso')


def downgrade() -> None:
    op.create_table(
        'paso',
        sa.Column('id_paso', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('id_protocolo', sa.String(10), sa.ForeignKey('protocolo.id_protocolo'), nullable=False),
        sa.Column('condicion', sa.String(20), nullable=True),
        sa.Column('id_siguiente', sa.String(10), sa.ForeignKey('protocolo.id_protocolo'), nullable=True),
        sa.Column('id_anexo', sa.String(10), sa.ForeignKey('protocolo.id_protocolo'), nullable=True),
    )
