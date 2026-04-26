# M6 — Recordes: Tasks

**Spec**: `.specs/features/m6-records/spec.md`
**Status**: Approved

> **Arquitetura:**
> - Backend: tabela `games` + `POST /api/games` + `GET /api/players/me/games` + `GET /api/players/me/stats`
> - Frontend: `records.js` chama `POST /api/games` ao fim da partida; `records.html` exibe histórico e stats
>
> **Modo PVC:** `player2_id = null`, `winner_id = null` se IA venceu ou empate.
> **Validação:** `score1 + score2 == 61` (backend rejeita com 422 caso contrário).

---

## Execution Plan

### Phase 1 — Backend (Sequential)
```
T1 (modelo Game + migração 0003)
  → T2 (POST /api/games + GET /api/players/me/games + GET /api/players/me/stats + testes)
```

### Phase 2 — Frontend (Parallel após T2)
```
T2 ──┬── T3 [P] (records.js — salva partida + aviso de falha)
     └── T4 [P] (records.html — tela de histórico e stats)
```

---

## Task Breakdown

### T1: modelo Game + migração 0003

**What**: Modelo SQLAlchemy `Game` e migração Alembic que cria a tabela `games`.
**Where**: `backend/app/models/game.py`, `backend/alembic/versions/0003_games.py`
**Depends on**: M2 (User model)
**Requirement**: REC-03

**Done when**:
- [ ] `Game` model com campos: `id` (UUID PK), `player1_id` (FK users NOT NULL), `player2_id` (FK users NULLABLE), `winner_id` (FK users NULLABLE), `score_player1` (INT), `score_player2` (INT), `mode` (String: `pvp`/`pvc`), `played_at` (DateTime tz)
- [ ] Migração `0003_games.py` cria tabela e FKs corretamente
- [ ] `alembic upgrade head` aplica sem erros

**Tests**: migration smoke
**Gate**: `docker compose exec backend alembic upgrade head` → sem erros

**Commit**: `feat(db): add Game model and migration 0003`

---

### T2: API de partidas — POST + GET histórico + GET stats

**What**: Três endpoints na API: registrar partida, listar histórico, retornar estatísticas.
**Where**: `backend/app/api/games.py`, `backend/app/main.py` (registrar router), `backend/tests/test_games.py`
**Depends on**: T1
**Requirement**: REC-02, REC-04, REC-05, REC-08

**Done when**:
- [ ] `POST /api/games` — cria registro; valida `score1 + score2 == 61` (422 se inválido); retorna `{"game_id": "..."}` com HTTP 201
- [ ] `GET /api/players/me/games` — retorna últimas 20 partidas ordenadas por `played_at` DESC; cada item tem `game_id`, `opponent_name` ("Computador" se `player2_id` null), `result` (`win`/`loss`/`draw`), `score_player`, `score_opponent`, `mode`, `played_at`
- [ ] `GET /api/players/me/stats` — retorna `total_games`, `wins`, `losses`, `draws`, `win_rate` (0–100, 1 decimal)
- [ ] Testes unitários: POST válido → 201, POST com score inválido → 422, GET games lista vazia → [], GET stats sem partidas → zeros

**Tests**: unit
**Gate**: `docker compose exec backend python -m pytest tests/test_games.py -v`

**Commit**: `feat(api): add game recording endpoints with stats`

---

### T3: records.js — salvar partida ao fim do jogo [P]

**What**: Módulo frontend que chama `POST /api/games` quando a partida termina e exibe aviso sutil em caso de falha.
**Where**: `frontend/js/records.js`, atualizar `frontend/js/ui.js` (showGameOver recebe callback), `frontend/index.html`
**Depends on**: T2
**Requirement**: REC-01, REC-07

**Done when**:
- [ ] `saveGame(game, mode, playerId)` — monta payload e chama `POST /api/games` com token JWT
- [ ] Em modo `pvp`: `player2_id = null` (não há Player 2 cadastrado); `winner_id = null` se empate ou IA venceu
- [ ] Em modo `pvc`: `player2_id = null`; `winner_id = null` se IA venceu ou empate
- [ ] Se `POST` falha: exibe `#save-error` no overlay ("Não foi possível salvar o resultado")
- [ ] Chamado em `main.js` antes de `ui.showGameOver(game)`

**Tests**: smoke
**Gate**: Smoke — jogar uma partida → verificar no banco que registro foi criado

**Commit**: `feat(ui): auto-save game result on game over`

---

### T4: records.html — tela de histórico e estatísticas [P]

**What**: Página de recordes: exibe stats resumidas e lista das últimas 20 partidas do jogador.
**Where**: `frontend/records.html`, `frontend/css/records.css`, `frontend/js/records-page.js`
**Depends on**: T2
**Requirement**: REC-06

**Done when**:
- [ ] `records.html` acessível pelo menu (link em `mode-select.html`)
- [ ] Exibe: total de partidas, vitórias, derrotas, empates, win rate
- [ ] Lista de partidas: data, oponente, resultado (Vitória/Derrota/Empate), placar
- [ ] Loading state enquanto carrega dados
- [ ] Mensagem de erro se a API falhar
- [ ] Botão "Voltar" retorna para `mode-select.html`

**Tests**: smoke
**Gate**: Smoke — verificar no browser após jogar pelo menos uma partida

**Commit**: `feat(ui): add records screen with history and stats`

---

## Parallel Execution Map

```
Phase 1 (Sequential):
  T1 → T2

Phase 2 (Parallel — após T2):
  T2 ──┬── T3 [P]
       └── T4 [P]
```

---

## Requirement Traceability Update

| Requirement ID | Story | Task | Status |
|---|---|---|---|
| REC-01 | Registro automático ao fim da partida | T3 | Pending |
| REC-02 | POST /api/games | T2 | Pending |
| REC-03 | Tabela games com schema correto | T1 | Pending |
| REC-04 | GET /api/players/me/games | T2 | Pending |
| REC-05 | GET /api/players/me/stats | T2 | Pending |
| REC-06 | Tela de recordes no frontend | T4 | Pending |
| REC-07 | Tratamento de falha de registro | T3 | Pending |
| REC-08 | Validação score1 + score2 == 61 | T2 | Pending |

**Coverage:** 8 requisitos, 8 mapeados ✅
