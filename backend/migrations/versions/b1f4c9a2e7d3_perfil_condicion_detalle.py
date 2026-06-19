"""perfil_condicion detalle + cascade + index + cedula not null

Revision ID: b1f4c9a2e7d3
Revises: 537999885d17
Create Date: 2026-06-18 21:30:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'b1f4c9a2e7d3'
down_revision: Union[str, None] = '537999885d17'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Detalle personal del usuario sobre la condición
    op.add_column('perfil_condicion', sa.Column('detalle', sa.Text(), nullable=True))

    # 2. [A] FK con ON DELETE CASCADE
    op.drop_constraint('perfil_condicion_id_perfil_fkey', 'perfil_condicion', type_='foreignkey')
    op.drop_constraint('perfil_condicion_id_condicion_fkey', 'perfil_condicion', type_='foreignkey')
    op.create_foreign_key(
        'perfil_condicion_id_perfil_fkey', 'perfil_condicion', 'perfil_clinico',
        ['id_perfil'], ['id_perfil'], ondelete='CASCADE',
    )
    op.create_foreign_key(
        'perfil_condicion_id_condicion_fkey', 'perfil_condicion', 'condicion',
        ['id_condicion'], ['id_condicion'], ondelete='CASCADE',
    )

    # 3. [B] Índice sobre id_condicion (para el futuro motor de alertas)
    op.create_index('ix_perfil_condicion_id_condicion', 'perfil_condicion', ['id_condicion'])

    # 4. [C] Todo perfil clínico pertenece a un usuario
    op.alter_column('perfil_clinico', 'cedula', existing_type=sa.String(11), nullable=False)


def downgrade() -> None:
    op.alter_column('perfil_clinico', 'cedula', existing_type=sa.String(11), nullable=True)

    op.drop_index('ix_perfil_condicion_id_condicion', table_name='perfil_condicion')

    op.drop_constraint('perfil_condicion_id_condicion_fkey', 'perfil_condicion', type_='foreignkey')
    op.drop_constraint('perfil_condicion_id_perfil_fkey', 'perfil_condicion', type_='foreignkey')
    op.create_foreign_key(
        'perfil_condicion_id_condicion_fkey', 'perfil_condicion', 'condicion',
        ['id_condicion'], ['id_condicion'],
    )
    op.create_foreign_key(
        'perfil_condicion_id_perfil_fkey', 'perfil_condicion', 'perfil_clinico',
        ['id_perfil'], ['id_perfil'],
    )

    op.drop_column('perfil_condicion', 'detalle')
