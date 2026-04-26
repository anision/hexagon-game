"""Create games table

Revision ID: 0003
Revises: 0002
Create Date: 2026-04-26

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = '0003'
down_revision: Union[str, None] = '0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'games',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('player1_id', sa.String(36),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('player2_id', sa.String(36),
                  sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('winner_id', sa.String(36),
                  sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('score_player1', sa.Integer, nullable=False),
        sa.Column('score_player2', sa.Integer, nullable=False),
        sa.Column('mode', sa.String(3), nullable=False),
        sa.Column('played_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_games_player1_id', 'games', ['player1_id'])
    op.create_index('ix_games_played_at', 'games', ['played_at'])


def downgrade() -> None:
    op.drop_index('ix_games_played_at', table_name='games')
    op.drop_index('ix_games_player1_id', table_name='games')
    op.drop_table('games')
