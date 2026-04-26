# M3 — Motor do Jogo (Game Engine)

## Problem Statement

O coração do Hexagon é sua lógica de jogo — as regras que determinam movimentos válidos, conquistas de peças e condição de vitória. Essa lógica precisa ser implementada de forma pura (sem acoplamento à interface gráfica) para que possa ser testada com precisão, reutilizada tanto pela UI quanto pela IA, e evoluída sem risco de regressão.

## Goals

- [ ] Toda a lógica do jogo encapsulada em módulo independente de interface
- [ ] Regras 100% cobertas com testes unitários
- [ ] Motor reutilizável pela IA (M5) e pela interface Canvas (M4)

## Out of Scope

| Feature | Reason |
|---|---|
| Renderização gráfica | Escopo do M4 |
| IA / jogador computador | Escopo do M5 |
| Persistência de partidas | Escopo do M6 |
| Animações e efeitos visuais | Escopo do M4 |

---

## User Stories

### P1: Representação do tabuleiro hexagonal ⭐ MVP

**User Story**: Como motor do jogo, quero representar o tabuleiro hexagonal em memória para que todas as operações de jogo possam ser calculadas sobre ele.

**Why P1**: Toda a lógica depende de uma representação correta do tabuleiro.

**Acceptance Criteria**:

1. WHEN o tabuleiro é inicializado THEN o sistema SHALL criar uma grade hexagonal de raio 4 contendo exatamente 61 células
2. WHEN uma célula é referenciada por coordenada (q, r) no sistema axial THEN o sistema SHALL retornar seu estado: `empty`, `player1` ou `player2`
3. WHEN o tabuleiro é inicializado THEN as 6 posições de vértice SHALL estar ocupadas: Player 1 nos vértices (0,−4), (−4,4), (4,0) e Player 2 nos vértices (0,4), (4,−4), (−4,0)

**Independent Test**: Instanciar o tabuleiro e verificar que `len(board.cells) == 61` e que as 6 posições iniciais estão corretas.

---

### P1: Cálculo de células vizinhas ⭐ MVP

**User Story**: Como motor do jogo, quero calcular as células vizinhas de qualquer posição para determinar movimentos válidos e conquistas.

**Why P1**: Vizinhança é usada em todas as operações: movimento, conquista e detecção de fim de jogo.

**Acceptance Criteria**:

1. WHEN `get_neighbors(q, r)` é chamado para uma célula central THEN SHALL retornar exatamente 6 vizinhos
2. WHEN `get_neighbors(q, r)` é chamado para uma célula de borda THEN SHALL retornar apenas os vizinhos que existem dentro do tabuleiro (3 a 5)
3. WHEN `get_jump_targets(q, r)` é chamado THEN SHALL retornar todas as células a exatamente 2 passos de distância hexagonal que estejam dentro do tabuleiro

**Independent Test**: Chamar `get_neighbors(0, 0)` → esperar 6 vizinhos. Chamar para vértice → esperar 3 vizinhos.

---

### P1: Movimento curto — duplicação de peça ⭐ MVP

**User Story**: Como motor do jogo, quero processar o movimento curto (1 casa) para duplicar a peça do jogador.

**Why P1**: É um dos dois tipos de movimento do jogo.

**Acceptance Criteria**:

1. WHEN `move_short(from, to, player)` é chamado com uma célula vazia adjacente THEN o sistema SHALL criar uma cópia da peça em `to` mantendo a peça original em `from`
2. WHEN `move_short` é chamado com destino ocupado ou fora do tabuleiro THEN o sistema SHALL retornar erro `InvalidMove`
3. WHEN `move_short` é chamado com destino não adjacente (distância > 1) THEN o sistema SHALL retornar erro `InvalidMove`

**Independent Test**: Executar um movimento curto e verificar que a célula de origem e a de destino ambas contêm a peça do jogador.

---

### P1: Movimento longo — pulo de peça ⭐ MVP

**User Story**: Como motor do jogo, quero processar o movimento longo (pulo de 2 casas) para mover a peça sem duplicar.

**Why P1**: É o segundo tipo de movimento do jogo.

**Acceptance Criteria**:

1. WHEN `move_long(from, to, player)` é chamado com destino a 2 passos de distância THEN o sistema SHALL mover a peça de `from` para `to`, deixando `from` vazia
2. WHEN `move_long` é chamado com destino ocupado ou fora do tabuleiro THEN o sistema SHALL retornar erro `InvalidMove`
3. WHEN `move_long` é chamado com destino a distância diferente de 2 THEN o sistema SHALL retornar erro `InvalidMove`

**Independent Test**: Executar um movimento longo e verificar que a célula de origem ficou vazia e a de destino contém a peça.

---

### P1: Conquista de peças adjacentes ⭐ MVP

**User Story**: Como motor do jogo, quero que após qualquer movimento as peças do oponente adjacentes à célula destino sejam conquistadas.

**Why P1**: É a mecânica central que torna o jogo estratégico.

**Acceptance Criteria**:

1. WHEN qualquer movimento (curto ou longo) é concluído THEN o sistema SHALL verificar todos os vizinhos da célula destino
2. WHEN um vizinho pertence ao oponente THEN o sistema SHALL converter essa peça para o jogador atual
3. WHEN múltiplas peças do oponente são adjacentes THEN todas SHALL ser conquistadas no mesmo turno
4. WHEN nenhuma peça do oponente é adjacente THEN nenhuma conversão SHALL ocorrer

**Independent Test**: Posicionar peças do oponente ao redor de uma célula destino, executar um movimento e verificar que todas foram convertidas.

---

### P1: Alternância de turnos ⭐ MVP

**User Story**: Como motor do jogo, quero controlar a alternância de turnos entre os dois jogadores para garantir que cada um jogue uma vez por rodada.

**Why P1**: Sem controle de turno, o jogo não tem estrutura.

**Acceptance Criteria**:

1. WHEN o jogo inicia THEN o turno SHALL ser do Player 1
2. WHEN um movimento válido é executado THEN o turno SHALL passar para o outro jogador
3. WHEN um jogador tenta mover uma peça que não é sua THEN o sistema SHALL retornar erro `NotYourTurn`

**Independent Test**: Verificar que `current_player` alterna entre 1 e 2 após cada movimento válido.

---

### P1: Detecção de fim de jogo e vencedor ⭐ MVP

**User Story**: Como motor do jogo, quero detectar automaticamente quando o jogo termina e determinar o vencedor.

**Why P1**: Sem fim de jogo definido, a partida nunca termina.

**Acceptance Criteria**:

1. WHEN todas as 61 células do tabuleiro estão ocupadas THEN `is_game_over()` SHALL retornar `True`
2. WHEN `is_game_over()` retorna `True` THEN `get_winner()` SHALL retornar o jogador com mais peças no tabuleiro
3. WHEN ambos os jogadores têm o mesmo número de peças THEN `get_winner()` SHALL retornar `draw`
4. WHEN `is_game_over()` retorna `False` THEN `get_winner()` SHALL retornar `None`

**Independent Test**: Preencher o tabuleiro manualmente e verificar que `is_game_over()` retorna `True` e `get_winner()` retorna o jogador correto.

---

### P1: Listagem de movimentos válidos ⭐ MVP

**User Story**: Como motor do jogo, quero listar todos os movimentos válidos de uma peça selecionada para que a interface possa destacar as casas disponíveis.

**Why P1**: Necessário tanto para a UI (highlight) quanto para a IA (M5).

**Acceptance Criteria**:

1. WHEN `get_valid_moves(q, r, player)` é chamado THEN SHALL retornar duas listas: `short_moves` (adjacentes vazias) e `long_moves` (a 2 passos, vazias)
2. WHEN a peça não pertence ao `player` informado THEN SHALL retornar listas vazias
3. WHEN a peça está completamente cercada THEN ambas as listas SHALL estar vazias

**Independent Test**: Chamar `get_valid_moves` para uma peça no centro do tabuleiro vazio e verificar que retorna 6 movimentos curtos e até 12 movimentos longos.

---

## Edge Cases

- WHEN o tabuleiro tem apenas células vazias e peças de um jogador THEN `is_game_over()` SHALL retornar `False` (tabuleiro não está cheio)
- WHEN um jogador não tem mais peças THEN o jogo SHALL continuar até o tabuleiro estar cheio (não há derrota por eliminação total na v1)
- WHEN coordenadas fora dos limites do tabuleiro são passadas para qualquer função THEN o sistema SHALL retornar erro `InvalidCoordinate`

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| ENGINE-01 | Tabuleiro hexagonal 61 células | Tasks | Verified |
| ENGINE-02 | Posições iniciais dos jogadores | Tasks | Verified |
| ENGINE-03 | Cálculo de vizinhos (adjacentes) | Tasks | Verified |
| ENGINE-04 | Cálculo de alvos de pulo (2 passos) | Tasks | Verified |
| ENGINE-05 | Movimento curto com duplicação | Tasks | Verified |
| ENGINE-06 | Movimento longo sem duplicação | Tasks | Verified |
| ENGINE-07 | Conquista de peças adjacentes | Tasks | Verified |
| ENGINE-08 | Alternância de turnos | Tasks | Verified |
| ENGINE-09 | Detecção de fim de jogo | Tasks | Verified |
| ENGINE-10 | Determinação do vencedor | Tasks | Verified |
| ENGINE-11 | Listagem de movimentos válidos | Tasks | Verified |

**Coverage:** 11 requisitos, 0 mapeados para tasks, 11 pendentes ⚠️

---

## Success Criteria

- [ ] `len(board.cells) == 61` após inicialização
- [ ] Posições iniciais das 6 peças corretas
- [ ] Movimento curto: peça original mantida + cópia criada
- [ ] Movimento longo: peça movida + origem vazia
- [ ] Conquista ocorre em todos os vizinhos do destino
- [ ] `is_game_over()` detecta corretamente tabuleiro cheio
- [ ] 100% dos testes unitários passando
