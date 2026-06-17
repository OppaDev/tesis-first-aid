"""create_paso_table

Revision ID: 537999885d17
Revises: 0ec7b0c70609
Create Date: 2026-06-17 01:25:50.308911

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = '537999885d17'
down_revision: Union[str, None] = '0ec7b0c70609'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'paso',
        sa.Column('id_paso', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('id_protocolo', sa.String(10), sa.ForeignKey('protocolo.id_protocolo'), nullable=False, unique=True),
        sa.Column('paso_siguiente', sa.String(10), nullable=True),
        sa.Column('paso_siguiente_no', sa.String(10), nullable=True),
        sa.Column('anexo_si', sa.String(10), nullable=True),
        sa.Column('anexo_no', sa.String(10), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('paso')
