# M4 — Interface do Jogo: Tasks

**Spec**: `.specs/features/m4-game-interface/spec.md`
**Status**: Approved

> **Arquitetura:** A interface é composta por 3 módulos JS + atualização do main.js:
> - `renderer.js` — desenha tudo no Canvas (tabuleiro, peças, highlights, animações)
> - `input.js` — converte cliques em coordenadas hex e gerencia seleção
> - `ui.js` — atualiza DOM (turno, placar, overlay de fim de jogo)
> - `main.js` — conecta motor do jogo (M3) com interface
>
> **Geometria:** Hexágonos flat-top com coordenadas axiais.
> Conversão hex→pixel e pixel→hex via fórmulas padrão de cube coordinates.
>
> **Testes:** Smoke tests visuais no browser (Canvas não é testável em Node.js sem jsdom).
> `renderer.js` expõe `hexToPixel` e `pixelToHex` como funções puras testáveis em Node.js.

---

## Execution Plan

### Phase 1 — Renderer (Sequential)
```
T1 (renderer.js — geometria + draw functions + testes das funções puras)
```

### Phase 2 — Input + UI (Parallel após T1)
```
T1 ──┬── T2 [P] (input.js — cliques + seleção)
     └── T3 [P] (ui.js — DOM: turno, placar, overlay)
```

### Phase 3 — Wiring (Sequential após T2 + T3)
```
T2 + T3 → T4 (main.js — conecta tudo)
```

---

## Task Breakdown

### T1: renderer.js — geometria hexagonal e desenho no Canvas

**What**: Módulo de renderização: converte coordenadas hex↔pixel e desenha tabuleiro, peças e highlights no Canvas.
**Where**: `frontend/js/renderer.js`, `frontend/js/engine/tests/test_renderer.js`
**Depends on**: M3 (engine)
**Requirement**: UI-01, UI-02, UI-03, UI-13, UI-14

**Done when**:
- [ ] `hexToPixel(q, r, size, cx, cy)` — converte axial para pixel (flat-top)
- [ ] `pixelToHex(x, y, size, cx, cy)` — converte pixel para axial (com cube rounding)
- [ ] `drawBoard(ctx, board, selected, shortMoves, longMoves, lastMove)` — desenha todas as 61 células, peças, highlights e última jogada
- [ ] Cores: vazio=`#16213e`, player1=`#4361ee`, player2=`#e63946`, selecionado=borda `#ffffff`, short=`#4ade80`, long=`#fbbf24`, lastMove=borda `#94a3b8`
- [ ] `resizeCanvas(canvas)` — ajusta tamanho do Canvas à janela (responsivo)
- [ ] Animação de conquista: flash de `#ffffff` por 150ms via `requestAnimationFrame`
- [ ] Testes unitários de `hexToPixel` e `pixelToHex` (round-trip)

**Tests**: unit (funções puras) + smoke (visual)
**Gate**: `node frontend/js/engine/tests/test_renderer.js`

**Commit**: `feat(ui): add Canvas renderer with hex geometry`

---

### T2: input.js — gestão de cliques e seleção [P]

**What**: Módulo que intercepta cliques no Canvas, identifica a célula clicada, gerencia seleção e dispara movimentos.
**Where**: `frontend/js/input.js`
**Depends on**: T1
**Requirement**: UI-04, UI-05, UI-06, UI-07, UI-08

**Done when**:
- [ ] `setupInput(canvas, game, renderer, ui)` — registra listener de clique no Canvas
- [ ] Ao clicar: converte pixel→hex, identifica célula; se peça do jogador atual → seleciona e chama `getValidMoves`; se célula destacada → executa movimento; se outro clique → cancela seleção
- [ ] Estado interno: `selectedCell`, `shortMoves`, `longMoves`
- [ ] Após movimento: chama `renderer.drawBoard` e `ui.update`; verifica `game.isGameOver()` e exibe overlay se necessário
- [ ] Cliques fora do tabuleiro (pixelToHex retorna null) são ignorados
- [ ] Flag `isAnimating` bloqueia cliques durante flash de conquista

**Tests**: smoke
**Gate**: Smoke — testar no browser: clicar peça → ver highlights; clicar destino → ver movimento

**Commit**: `feat(ui): add click input handler with selection management`

---

### T3: ui.js — DOM: turno, placar e overlay de fim de jogo [P]

**What**: Módulo que atualiza os elementos DOM fora do Canvas: indicador de turno, placar e overlay de fim de jogo.
**Where**: `frontend/js/ui.js`, atualizar `frontend/index.html`
**Depends on**: T1
**Requirement**: UI-09, UI-10, UI-11, UI-12

**Done when**:
- [ ] `index.html` tem elementos: `#turn-indicator`, `#score-p1`, `#score-p2`, `#game-overlay` (hidden), `#overlay-message`, `#overlay-score`, `#btn-restart`
- [ ] `ui.update(game)` — atualiza turno ("Vez do Jogador 1" azul / "Vez do Jogador 2" vermelho) e placar (contagem de peças)
- [ ] `ui.showGameOver(game)` — exibe overlay com resultado ("Jogador 1 venceu!" / "Jogador 2 venceu!" / "Empate!") e placar final
- [ ] `ui.hideGameOver()` — esconde overlay
- [ ] Botão "Jogar novamente" chama callback de restart
- [ ] Placar inicial: 3 × 3

**Tests**: smoke
**Gate**: Smoke — verificar visualmente no browser

**Commit**: `feat(ui): add turn indicator, scoreboard and game over overlay`

---

### T4: Atualizar main.js — conectar motor, renderer, input e UI

**What**: Reescrever `main.js` para inicializar o jogo completo: criar `HexGame`, configurar renderer, input e UI, e gerenciar reinício de partida.
**Where**: `frontend/js/main.js`
**Depends on**: T2, T3
**Requirement**: UI-06, UI-07, UI-08, UI-12

**Done when**:
- [ ] `main.js` importa `HexGame`, `drawBoard`, `resizeCanvas`, `setupInput`, `ui`
- [ ] Na carga: inicializa jogo, desenha tabuleiro, atualiza UI
- [ ] `window.addEventListener('resize')` chama `resizeCanvas` e redesenha
- [ ] Botão restart cria novo `HexGame`, esconde overlay e redesenha tudo
- [ ] Fluxo completo: login → jogo carrega → partida jogável até fim → overlay → restart
- [ ] Captura e exibe token da URL (integração com auth do M2)

**Tests**: smoke
**Gate**: Smoke — jogar uma partida completa no browser

**Commit**: `feat(ui): wire game engine to canvas interface`

---

## Parallel Execution Map

```
Phase 1 (Sequential):
  T1

Phase 2 (Parallel — após T1):
  T1 ──┬── T2 [P]
       └── T3 [P]

Phase 3 (Sequential — após T2 + T3):
  T2 + T3 → T4
```

---

## Task Granularity Check

| Task | Escopo | Status |
|---|---|---|
| T1: renderer.js + testes | 1 módulo de renderização | ✅ Granular |
| T2: input.js | 1 módulo de input | ✅ Granular |
| T3: ui.js + html updates | 1 módulo DOM + markup coesos | ✅ OK |
| T4: main.js wiring | 1 arquivo de bootstrapping | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagrama mostra | Status |
|---|---|---|---|
| T1 | M3 completo | Início Phase 1 | ✅ Match |
| T2 | T1 | T1 → T2 [P] | ✅ Match |
| T3 | T1 | T1 → T3 [P] | ✅ Match |
| T4 | T2, T3 | T2 + T3 → T4 | ✅ Match |

---

## Requirement Traceability Update

| Requirement ID | Story | Task | Status |
|---|---|---|---|
| UI-01 | Renderização 61 células | T1 | Pending |
| UI-02 | Cores por jogador | T1 | Pending |
| UI-03 | Reescala responsiva | T1 | Pending |
| UI-04 | Seleção de peça | T2 | Pending |
| UI-05 | Highlight movimentos válidos | T2 | Pending |
| UI-06 | Movimento curto via clique | T2, T4 | Pending |
| UI-07 | Movimento longo via clique | T2, T4 | Pending |
| UI-08 | Atualização de conquistas | T2, T4 | Pending |
| UI-09 | Indicador de turno | T3 | Pending |
| UI-10 | Placar em tempo real | T3 | Pending |
| UI-11 | Overlay fim de jogo | T3 | Pending |
| UI-12 | Botão "Jogar novamente" | T3, T4 | Pending |
| UI-13 | Animação (~200ms flash) | T1 | Pending |
| UI-14 | Highlight última jogada | T1, T2 | Pending |

**Coverage:** 14 requisitos, 14 mapeados ✅
