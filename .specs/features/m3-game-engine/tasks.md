# M3 — Motor do Jogo: Tasks

**Spec**: `.specs/features/m3-game-engine/spec.md`
**Status**: Done

> **Decisão de arquitetura:** O motor do jogo vive no **frontend (JavaScript ES2022)**,
> pois o jogo roda inteiro no browser sem multiplayer online em tempo real.
> O backend (Python) cuida apenas de auth e recordes.
>
> **Testes:** Node.js + módulo `assert` nativo (sem framework externo).
> Todos os arquivos são ES Modules (`type: module`).

---

## Execution Plan

### Phase 1 — Utilitários de coordenadas (Sequential)
```
T1 (hex_utils.js + tests)
```

### Phase 2 — Tabuleiro (Sequential após T1)
```
T1 → T2 (board.js + tests)
```

### Phase 3 — Motor de jogo (Sequential após T2)
```
T2 → T3 (game.js: movimentos + conquista + tests)
     → T4 (game.js: turnos + fim de jogo + movimentos válidos + tests)
```

---

## Task Breakdown

### T1: hex_utils.js — utilitários de coordenadas hexagonais

**What**: Funções puras de geometria hexagonal: verificar se coordenada está no tabuleiro, calcular vizinhos, calcular alvos de pulo e distância hex.
**Where**: `frontend/js/engine/hex_utils.js`, `frontend/js/engine/tests/test_hex_utils.js`
**Depends on**: Nenhuma
**Requirement**: ENGINE-03, ENGINE-04

**Done when**:
- [ ] `isInBoard(q, r, radius=4)` — retorna `true` se a célula (q,r) existe no tabuleiro de raio `radius`
- [ ] `getNeighbors(q, r)` — retorna array com vizinhos válidos (dentro do tabuleiro) usando as 6 direções axiais
- [ ] `getJumpTargets(q, r)` — retorna array com células a exatamente 2 passos de distância (vazias não verificadas aqui — apenas geometria)
- [ ] `hexDistance(q1, r1, q2, r2)` — retorna distância hexagonal entre dois pontos
- [ ] Testes passando: célula central tem 6 vizinhos, vértice tem 3 vizinhos, distância correta

**Tests**: unit
**Gate**: `node --input-type=module < frontend/js/engine/tests/test_hex_utils.js`

**Commit**: `feat(engine): add hex coordinate utilities with tests`

---

### T2: board.js — tabuleiro hexagonal

**What**: Classe `HexBoard` que representa o estado do tabuleiro: 61 células, posições iniciais e acesso ao estado de cada célula.
**Where**: `frontend/js/engine/board.js`, `frontend/js/engine/tests/test_board.js`
**Depends on**: T1
**Requirement**: ENGINE-01, ENGINE-02

**Done when**:
- [ ] `HexBoard` inicializa com `radius=4` e cria exatamente 61 células (todas `'empty'`)
- [ ] `board.cells` é um `Map` com chave `"q,r"` e valor `'empty' | 'player1' | 'player2'`
- [ ] `board.get(q, r)` retorna o estado da célula ou lança `InvalidCoordinate` se fora do tabuleiro
- [ ] `board.set(q, r, value)` atualiza o estado da célula
- [ ] `board.setup()` coloca as 6 peças iniciais: P1 em `(0,-4),(−4,4),(4,0)` e P2 em `(0,4),(4,-4),(−4,0)`
- [ ] `board.countPieces()` retorna `{ player1: N, player2: N, empty: N }`
- [ ] Testes: 61 células, posições iniciais corretas, countPieces correto

**Tests**: unit
**Gate**: `node --input-type=module < frontend/js/engine/tests/test_board.js`

**Commit**: `feat(engine): add HexBoard class with tests`

---

### T3: game.js — movimentos e conquista

**What**: Classe `HexGame` com a lógica de movimentos (curto/longo) e conquista de peças adjacentes.
**Where**: `frontend/js/engine/game.js`, `frontend/js/engine/tests/test_game_moves.js`
**Depends on**: T2
**Requirement**: ENGINE-05, ENGINE-06, ENGINE-07

**Done when**:
- [ ] `HexGame` inicializa com um `HexBoard` e `currentPlayer = 'player1'`
- [ ] `game.moveShort(fromQ, fromR, toQ, toR)` — duplica peça (origem mantida, destino recebe cópia); lança `InvalidMove` se destino ocupado, fora do tabuleiro ou distância ≠ 1
- [ ] `game.moveLong(fromQ, fromR, toQ, toR)` — move peça (origem fica `empty`, destino recebe peça); lança `InvalidMove` se destino ocupado, fora do tabuleiro ou distância ≠ 2
- [ ] Após qualquer movimento, `_capture(toQ, toR)` converte todos os vizinhos do oponente para o jogador atual
- [ ] `InvalidMove` é uma classe de erro customizada (não genérica)
- [ ] Testes: short mantém origem, long limpa origem, conquista converte vizinhos

**Tests**: unit
**Gate**: `node --input-type=module < frontend/js/engine/tests/test_game_moves.js`

**Commit**: `feat(engine): add move logic and capture mechanic with tests`

---

### T4: game.js — turnos, fim de jogo e movimentos válidos

**What**: Completar `HexGame` com alternância de turnos, detecção de fim de jogo, determinação de vencedor e listagem de movimentos válidos.
**Where**: `frontend/js/engine/game.js` (modificar), `frontend/js/engine/tests/test_game_state.js`
**Depends on**: T3
**Requirement**: ENGINE-08, ENGINE-09, ENGINE-10, ENGINE-11

**Done when**:
- [ ] `game.move(fromQ, fromR, toQ, toR)` — detecta se é short ou long pelo `hexDistance`, executa o movimento correto, faz capture e alterna turno; lança `NotYourTurn` se a peça não pertence ao `currentPlayer`
- [ ] `game.isGameOver()` — retorna `true` quando não há células `empty`
- [ ] `game.getWinner()` — retorna `'player1'`, `'player2'`, `'draw'` ou `null`
- [ ] `game.getValidMoves(q, r)` — retorna `{ shortMoves: [...], longMoves: [...] }` para a peça em (q,r); retorna listas vazias se peça não pertence ao `currentPlayer`
- [ ] `NotYourTurn` é uma classe de erro customizada
- [ ] Testes: turno alterna, game over detectado, vencedor correto, valid moves correto

**Tests**: unit
**Gate**: `node --input-type=module < frontend/js/engine/tests/test_game_state.js`

**Commit**: `feat(engine): add turn management, game over and valid moves with tests`

---

## Parallel Execution Map

```
Phase 1 (Sequential):
  T1

Phase 2 (Sequential):
  T1 → T2

Phase 3 (Sequential):
  T2 → T3 → T4
```

> Todas as tasks são sequenciais — cada uma depende da anterior.
> Paralelismo não se aplica aqui: as dependências formam uma cadeia linear.

---

## Task Granularity Check

| Task | Escopo | Status |
|---|---|---|
| T1: hex_utils.js + tests | 1 módulo de funções puras | ✅ Granular |
| T2: board.js + tests | 1 classe (estado do tabuleiro) | ✅ Granular |
| T3: game.js movimentos + tests | 1 classe (movimentos + capture) | ✅ Granular |
| T4: game.js estado + tests | mesma classe, funcionalidades distintas | ✅ OK (coesas) |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagrama mostra | Status |
|---|---|---|---|
| T1 | Nenhuma | Início Phase 1 | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |

---

## Test Co-location Validation

| Task | Camada criada | Gate | Status |
|---|---|---|---|
| T1 | Funções puras JS | unit (Node.js assert) | ✅ OK |
| T2 | Classe HexBoard | unit (Node.js assert) | ✅ OK |
| T3 | Métodos de movimento | unit (Node.js assert) | ✅ OK |
| T4 | Métodos de estado | unit (Node.js assert) | ✅ OK |

---

## Requirement Traceability Update

| Requirement ID | Story | Task | Status |
|---|---|---|---|
| ENGINE-01 | Tabuleiro 61 células | T2 | Pending |
| ENGINE-02 | Posições iniciais | T2 | Pending |
| ENGINE-03 | Vizinhos adjacentes | T1 | Pending |
| ENGINE-04 | Alvos de pulo (2 passos) | T1 | Pending |
| ENGINE-05 | Movimento curto | T3 | Pending |
| ENGINE-06 | Movimento longo | T3 | Pending |
| ENGINE-07 | Conquista de peças | T3 | Pending |
| ENGINE-08 | Alternância de turnos | T4 | Pending |
| ENGINE-09 | Detecção de fim de jogo | T4 | Pending |
| ENGINE-10 | Determinação do vencedor | T4 | Pending |
| ENGINE-11 | Listagem de movimentos válidos | T4 | Pending |

**Coverage:** 11 requisitos, 11 mapeados para tasks ✅
