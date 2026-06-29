"""usuario.token_version para revocación de JWT

Revision ID: e3a1c7d9b2f4
Revises: c2e5d8b3f1a9
Create Date: 2026-06-28 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'e3a1c7d9b2f4'
down_revision: Union[str, None] = 'c2e5d8b3f1a9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # server_default='0' rellena las filas existentes; se incrementa al cerrar sesión.
    op.add_column(
        'usuario',
        sa.Column('token_version', sa.Integer(), nullable=False, server_default='0'),
    )


def downgrade() -> None:
    op.drop_column('usuario', 'token_version')
