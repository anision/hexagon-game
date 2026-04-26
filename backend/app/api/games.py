import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.game import Game
from app.models.user import User

router = APIRouter(prefix="/api", tags=["games"])


# ─── Schemas ─────────────────────────────────────────────────────────────────

class GameCreateRequest(BaseModel):
    player2_id: Optional[str] = None   # null = PvC mode
    winner_id: Optional[str] = None    # null = draw or AI won
    score_player1: int
    score_player2: int
    mode: str                           # 'pvp' | 'pvc'

    @field_validator('mode')
    @classmethod
    def mode_must_be_valid(cls, v: str) -> str:
        if v not in ('pvp', 'pvc'):
            raise ValueError("mode must be 'pvp' or 'pvc'")
        return v


class GameCreateResponse(BaseModel):
    game_id: str


class GameHistoryItem(BaseModel):
    game_id: str
    opponent_name: str
    result: str          # 'win' | 'loss' | 'draw'
    score_player: int
    score_opponent: int
    mode: str
    played_at: datetime


class PlayerStats(BaseModel):
    total_games: int
    wins: int
    losses: int
    draws: int
    win_rate: float


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/games", status_code=status.HTTP_201_CREATED, response_model=GameCreateResponse)
async def create_game(
    body: GameCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.score_player1 + body.score_player2 != 61:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="score_player1 + score_player2 must equal 61",
        )

    game = Game(
        id=str(uuid.uuid4()),
        player1_id=current_user.id,
        player2_id=body.player2_id,
        winner_id=body.winner_id,
        score_player1=body.score_player1,
        score_player2=body.score_player2,
        mode=body.mode,
        played_at=datetime.now(timezone.utc),
    )
    db.add(game)
    await db.commit()

    return GameCreateResponse(game_id=game.id)


@router.get("/players/me/games", response_model=list[GameHistoryItem])
async def get_my_games(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Game)
        .where(Game.player1_id == current_user.id)
        .order_by(Game.played_at.desc())
        .limit(20)
    )
    games = result.scalars().all()

    items = []
    for g in games:
        # Resolve opponent name
        if g.player2_id is None:
            opponent_name = "Computador"
        else:
            opp_result = await db.execute(select(User).where(User.id == g.player2_id))
            opp = opp_result.scalar_one_or_none()
            opponent_name = opp.name if opp else "Desconhecido"

        # Determine result from player1's perspective.
        # winner_id=None means player2 won (draws impossible with 61 cells — odd total).
        if g.winner_id == current_user.id:
            result_str = "win"
        else:
            result_str = "loss"

        items.append(GameHistoryItem(
            game_id=g.id,
            opponent_name=opponent_name,
            result=result_str,
            score_player=g.score_player1,
            score_opponent=g.score_player2,
            mode=g.mode,
            played_at=g.played_at,
        ))

    return items


@router.get("/players/me/stats", response_model=PlayerStats)
async def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            func.count().label("total"),
            func.sum(case((Game.winner_id == current_user.id, 1), else_=0)).label("wins"),
        ).where(Game.player1_id == current_user.id)
    )
    row = result.one()

    # Draws are mathematically impossible with 61 cells (odd total — no equal split).
    # winner_id=None always means player2 won, so losses = total - wins.
    total  = row.total or 0
    wins   = int(row.wins or 0)
    draws  = 0
    losses = total - wins
    win_rate = round(wins / total * 100, 1) if total > 0 else 0.0

    return PlayerStats(
        total_games=total,
        wins=wins,
        losses=losses,
        draws=draws,
        win_rate=win_rate,
    )
