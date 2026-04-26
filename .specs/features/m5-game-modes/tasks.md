# M5 — Modos de Jogo: Tasks

**Spec**: `.specs/features/m5-game-modes/spec.md`
**Status**: Approved

> **Arquitetura:** 3 novos arquivos + updates em main.js e index.html:
> - `ai.js` — algoritmo greedy puro (testável em Node.js)
> - `mode-select.html` — tela de seleção de modo (página separada)
> - `mode-select.css` — estilos da tela de seleção
> - `main.js` — recebe `?mode=` na URL e configura o loop da IA se necessário
> - `index.html` — indicador "Computador pensando..."
>
> **Fluxo:** login → mode-select.html → index.html?mode=hotseat|ai

---

## Execution Plan

### Phase 1 — IA (Sequential)
```
T1 (ai.js — algoritmo greedy + testes unitários)
```

### Phase 2 — Tela de seleção + Wiring (Parallel após T1)
```
T1 ──┬── T2 [P] (mode-select.html + css)
     └── T3 [P] (main.js — integra IA, bloqueio de cliques, indicador)
```

---

## Task Breakdown

### T1: ai.js — algoritmo greedy

**What**: Módulo puro com a lógica de decisão da IA: enumera todos os movimentos válidos do Player 2, pontua cada um pelo número de conquistas e escolhe o melhor.
**Where**: `frontend/js/ai.js`, `frontend/js/engine/tests/test_ai.js`
**Depends on**: M3 (engine)
**Requirement**: MODES-07, MODES-08

**Done when**:
- [ ] `getBestMove(game)` — recebe um `HexGame`, retorna `{ fromQ, fromR, toQ, toR }` ou `null` se não houver movimentos
- [ ] Enumera todas as peças do `currentPlayer` e todos os movimentos válidos de cada uma
- [ ] Pontua cada movimento simulando a captura: conta vizinhos do destino que pertencem ao oponente
- [ ] Em empate de pontuação: movimentos curtos têm prioridade sobre longos; entre iguais, escolha aleatória
- [ ] Se nenhum movimento existe, retorna `null`
- [ ] Testes unitários: cenário com captura ótima, cenário sem capturas, cenário sem movimentos

**Tests**: unit
**Gate**: `node frontend/js/engine/tests/test_ai.js`

**Commit**: `feat(ai): add greedy AI with capture-maximizing strategy`

---

### T2: mode-select.html — tela de seleção de modo [P]

**What**: Página HTML separada com dois botões de seleção de modo. Redireciona para `index.html?mode=hotseat` ou `index.html?mode=ai`.
**Where**: `frontend/mode-select.html`, `frontend/css/mode-select.css`
**Depends on**: T1
**Requirement**: MODES-01, MODES-02, MODES-04, MODES-10

**Done when**:
- [ ] `mode-select.html` exibe dois botões: "Jogador vs Jogador" e "Jogador vs Computador"
- [ ] Clique em "Jogador vs Jogador" → redireciona para `index.html?mode=hotseat`
- [ ] Clique em "Jogador vs Computador" → redireciona para `index.html?mode=ai`
- [ ] Página verifica autenticação (redireciona para `login.html` se não logado)
- [ ] Exibe nome/avatar do jogador logado
- [ ] Visual consistente com a paleta do jogo (fundo `#1a1a2e`, botões com cores dos jogadores)
- [ ] `main.js` e `index.html`: botão "Jogar novamente" volta para `mode-select.html` (não reinicia direto)

**Tests**: smoke
**Gate**: Smoke — verificar no browser: dois botões visíveis, redirecionamento correto

**Commit**: `feat(ui): add game mode selection screen`

---

### T3: main.js — integrar IA e bloqueio de cliques [P]

**What**: Atualizar `main.js` para ler `?mode=` da URL, configurar loop da IA quando `mode=ai`, bloquear cliques humanos durante turno da IA e exibir "Computador pensando...".
**Where**: `frontend/js/main.js`, `frontend/index.html`
**Depends on**: T1
**Requirement**: MODES-03, MODES-05, MODES-06, MODES-09

**Done when**:
- [ ] Lê `?mode=hotseat|ai` da URL (default: `hotseat`)
- [ ] Se `mode=ai`: após cada movimento do Player 1, dispara `scheduleAiMove()` com setTimeout de 800ms
- [ ] `scheduleAiMove()`: chama `getBestMove(game)`, executa o movimento, redesenha, atualiza UI, verifica game over
- [ ] Durante turno da IA: `input.js` tem flag `isAiTurn` que bloqueia cliques humanos
- [ ] `index.html` tem elemento `#ai-thinking` (hidden por padrão); `main.js` o exibe durante o delay da IA e esconde após o movimento
- [ ] Botão restart redireciona para `mode-select.html`

**Tests**: smoke
**Gate**: Smoke — iniciar vs computador → IA joga automaticamente após 800ms; cliques durante o turno da IA são ignorados

**Commit**: `feat(ui): integrate AI loop and thinking indicator into main.js`

---

## Parallel Execution Map

```
Phase 1 (Sequential):
  T1

Phase 2 (Parallel — após T1):
  T1 ──┬── T2 [P]
       └── T3 [P]
```

---

## Requirement Traceability Update

| Requirement ID | Story | Task | Status |
|---|---|---|---|
| MODES-01 | Tela de seleção de modo | T2 | Pending |
| MODES-02 | Botões "vs Jogador" e "vs Computador" | T2 | Pending |
| MODES-03 | Hot-seat: bloqueio de cliques fora do turno | T3 | Pending |
| MODES-04 | Hot-seat: nomes "Jogador 1" e "Jogador 2" | T2 | Pending |
| MODES-05 | IA: delay de 800ms antes de jogar | T3 | Pending |
| MODES-06 | IA: bloqueio de cliques humanos durante turno da IA | T3 | Pending |
| MODES-07 | IA: algoritmo greedy por conquistas | T1 | Pending |
| MODES-08 | IA: prioridade para movimentos curtos em empate | T1 | Pending |
| MODES-09 | Indicador "Computador pensando..." | T3 | Pending |
| MODES-10 | Retorno à tela de seleção após fim de jogo | T2, T3 | Pending |

**Coverage:** 10 requisitos, 10 mapeados ✅
