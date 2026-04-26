import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_create_game_returns_201(client: AsyncClient):
    res = await client.post("/api/games", json={
        "player2_id": None,
        "winner_id": None,
        "score_player1": 35,
        "score_player2": 26,
        "mode": "pvc",
    })
    assert res.status_code == 201
    data = res.json()
    assert "game_id" in data
    assert len(data["game_id"]) == 36  # UUID


async def test_create_game_partial_board_returns_201(client: AsyncClient):
    # Game can end before board is full (player has no valid moves),
    # so score_player1 + score_player2 < 61 is valid.
    res = await client.post("/api/games", json={
        "score_player1": 30,
        "score_player2": 20,   # 50 pieces total — board not full
        "mode": "pvc",
    })
    assert res.status_code == 201


async def test_create_game_invalid_mode_returns_422(client: AsyncClient):
    res = await client.post("/api/games", json={
        "score_player1": 35,
        "score_player2": 26,
        "mode": "bad",
    })
    assert res.status_code == 422


async def test_get_games_empty_list(client: AsyncClient):
    res = await client.get("/api/players/me/games")
    assert res.status_code == 200
    assert res.json() == []


async def test_get_games_returns_created_game(client: AsyncClient):
    # Create a game first
    await client.post("/api/games", json={
        "score_player1": 40,
        "score_player2": 21,
        "mode": "pvc",
    })
    res = await client.get("/api/players/me/games")
    assert res.status_code == 200
    games = res.json()
    assert len(games) == 1
    g = games[0]
    assert g["opponent_name"] == "Computador"
    assert g["result"] == "loss"      # winner_id is null → player2 won → loss for player1
    assert g["score_player"] == 40
    assert g["score_opponent"] == 21
    assert g["mode"] == "pvc"


async def test_get_stats_no_games(client: AsyncClient):
    res = await client.get("/api/players/me/stats")
    assert res.status_code == 200
    s = res.json()
    assert s["total_games"] == 0
    assert s["wins"] == 0
    assert s["losses"] == 0
    assert s["draws"] == 0
    assert s["win_rate"] == 0.0


async def test_get_stats_with_games(client: AsyncClient, test_user):
    # 2 wins (winner_id = test_user.id), 1 loss (winner_id = None → player2 won)
    # Draws are impossible with 61 cells (odd total).
    for score in [(40, 21), (35, 26)]:
        await client.post("/api/games", json={
            "winner_id": test_user.id,
            "score_player1": score[0],
            "score_player2": score[1],
            "mode": "pvc",
        })
    await client.post("/api/games", json={
        "winner_id": None,
        "score_player1": 30,
        "score_player2": 31,
        "mode": "pvc",
    })

    res = await client.get("/api/players/me/stats")
    assert res.status_code == 200
    s = res.json()
    assert s["total_games"] == 3
    assert s["wins"] == 2
    assert s["draws"] == 0
    assert s["losses"] == 1
    assert s["win_rate"] == round(2 / 3 * 100, 1)
