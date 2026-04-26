# M5 — Modos de Jogo

## Problem Statement

Com o jogo funcionando visualmente (M4), é preciso suportar os dois modos planejados: dois jogadores na mesma máquina (hot-seat) e jogador versus computador. O modo hot-seat é simples — basta alternar o controle entre os jogadores. O modo contra o computador requer uma IA básica capaz de tomar decisões de jogo razoáveis sem ser invencível.

## Goals

- [ ] Jogadores podem escolher o modo de jogo antes de cada partida
- [ ] Modo hot-seat funcional: dois jogadores se alternam no mesmo browser
- [ ] Modo jogador vs computador funcional: IA toma decisões automaticamente no seu turno

## Out of Scope

| Feature | Reason |
|---|---|
| Multiplayer online (jogadores em máquinas diferentes) | Pós-v1 — requer WebSockets |
| Múltiplos níveis de dificuldade da IA | Pós-v1 |
| IA com Minimax ou Alpha-Beta Pruning | Pós-v1 |
| Escolha de qual jogador é a IA (Player 1 ou Player 2) | V1: IA é sempre Player 2 |

---

## User Stories

### P1: Tela de seleção de modo de jogo ⭐ MVP

**User Story**: Como jogador, quero escolher o modo de jogo antes de começar a partida para decidir se jogo contra outra pessoa ou contra o computador.

**Why P1**: Sem seleção de modo, o jogo sempre inicia no mesmo modo sem dar controle ao jogador.

**Acceptance Criteria**:

1. WHEN o jogador acessa a tela principal após login THEN o sistema SHALL exibir uma tela de seleção com dois botões: "Jogador vs Jogador" e "Jogador vs Computador"
2. WHEN o jogador clica em "Jogador vs Jogador" THEN o jogo SHALL iniciar no modo hot-seat
3. WHEN o jogador clica em "Jogador vs Computador" THEN o jogo SHALL iniciar com a IA como Player 2
4. WHEN a partida termina THEN o sistema SHALL oferecer opção de voltar à tela de seleção de modo

**Independent Test**: Acessar a tela principal → verificar que os dois botões de modo estão visíveis e funcionais.

---

### P1: Modo Hot-Seat (Jogador vs Jogador) ⭐ MVP

**User Story**: Como dois jogadores na mesma máquina, queremos nos alternar no controle do jogo para jogar uma partida completa.

**Why P1**: É o modo multiplayer básico e mais simples de implementar.

**Acceptance Criteria**:

1. WHEN o modo hot-seat está ativo THEN ambos os jogadores controlam suas peças com mouse no mesmo browser
2. WHEN é a vez do Player 1 THEN apenas as peças do Player 1 SHALL responder a cliques de seleção
3. WHEN é a vez do Player 2 THEN apenas as peças do Player 2 SHALL responder a cliques de seleção
4. WHEN Player 1 termina seu turno THEN a interface SHALL indicar "Vez do Jogador 2" e aguardar interação do Player 2
5. WHEN o modo hot-seat é selecionado THEN os nomes dos jogadores SHALL ser "Jogador 1" e "Jogador 2"

**Independent Test**: Iniciar modo hot-seat → verificar que cliques em peças do Player 2 são ignorados durante o turno do Player 1, e vice-versa.

---

### P1: Modo Jogador vs Computador — IA Básica ⭐ MVP

**User Story**: Como jogador solo, quero jogar contra o computador para praticar sem precisar de outro jogador disponível.

**Why P1**: Sem IA, o modo solo não existe e metade do valor da aplicação é perdido.

**Acceptance Criteria**:

1. WHEN o modo Jogador vs Computador está ativo THEN o Player 1 é controlado pelo humano e o Player 2 pela IA
2. WHEN é a vez da IA THEN o sistema SHALL aguardar 800ms (simulando "pensar") e então executar um movimento automaticamente
3. WHEN a IA executa seu movimento THEN o Canvas SHALL atualizar normalmente (mesmas animações do modo humano)
4. WHEN é a vez da IA THEN cliques do humano no tabuleiro SHALL ser ignorados
5. WHEN a IA não tem movimentos válidos THEN o turno SHALL passar automaticamente para o humano

**Independent Test**: Iniciar modo vs computador → deixar a IA jogar 3 turnos seguidos → verificar que os movimentos são válidos e o tabuleiro atualiza corretamente.

---

### P1: Algoritmo da IA — Estratégia Greedy ⭐ MVP

**User Story**: Como motor de IA, quero escolher o melhor movimento disponível usando uma heurística simples para que o computador seja um oponente minimamente desafiador.

**Why P1**: Uma IA que joga aleatoriamente não oferece valor ao jogador. A estratégia greedy é simples de implementar e já é desafiadora para iniciantes.

**Acceptance Criteria**:

1. WHEN é a vez da IA THEN o sistema SHALL avaliar todos os movimentos válidos de todas as peças da IA
2. WHEN avaliando movimentos THEN cada movimento SHALL receber uma pontuação = número de peças do oponente que seriam conquistadas
3. WHEN há múltiplos movimentos com a mesma pontuação máxima THEN a IA SHALL escolher aleatoriamente entre eles
4. WHEN nenhum movimento conquista peças do oponente THEN a IA SHALL escolher aleatoriamente entre os movimentos disponíveis
5. WHEN a IA prefere movimentos curtos vs longos com mesma pontuação THEN movimentos curtos (duplicação) SHALL ter prioridade (crescimento de peças)

**Independent Test**: Criar cenário onde a IA pode conquistar 3 peças com um movimento específico → verificar que a IA escolhe esse movimento.

---

### P2: Indicação visual do turno da IA

**User Story**: Como jogador humano, quero ver uma indicação clara de que é a vez do computador para saber que devo aguardar.

**Why P2**: Melhora a experiência, mas o jogo é funcional sem ela.

**Acceptance Criteria**:

1. WHEN é a vez da IA THEN a interface SHALL exibir "Computador pensando..." com uma animação de loading simples (ex: pontos piscando)
2. WHEN a IA executa o movimento THEN o indicador SHALL desaparecer e o turno SHALL ser passado ao humano

**Independent Test**: Iniciar partida vs computador → verificar que "Computador pensando..." aparece durante o delay da IA.

---

## Edge Cases

- WHEN a IA não encontra nenhum movimento válido (todas as peças bloqueadas) THEN o turno SHALL ser passado ao humano sem executar nenhum movimento
- WHEN o jogo termina durante o turno da IA (tabuleiro completo após movimento da IA) THEN o overlay de fim de jogo SHALL ser exibido normalmente
- WHEN o jogador humano clica durante o delay de 800ms da IA THEN os cliques SHALL ser enfileirados e ignorados (a IA não reage a cliques do humano)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| MODES-01 | Tela de seleção de modo | Tasks | Pending |
| MODES-02 | Botões "vs Jogador" e "vs Computador" | Tasks | Pending |
| MODES-03 | Hot-seat: bloqueio de cliques fora do turno | Tasks | Pending |
| MODES-04 | Hot-seat: nomes "Jogador 1" e "Jogador 2" | Tasks | Pending |
| MODES-05 | IA: delay de 800ms antes de jogar | Tasks | Pending |
| MODES-06 | IA: bloqueio de cliques humanos durante turno da IA | Tasks | Pending |
| MODES-07 | IA: algoritmo greedy por conquistas | Tasks | Pending |
| MODES-08 | IA: prioridade para movimentos curtos em empate | Tasks | Pending |
| MODES-09 | Indicador "Computador pensando..." | Tasks | Pending |
| MODES-10 | Retorno à tela de seleção após fim de jogo | Tasks | Pending |

**Coverage:** 10 requisitos, 0 mapeados para tasks, 10 pendentes ⚠️

---

## Success Criteria

- [ ] Tela de seleção de modo exibida antes de cada partida
- [ ] Modo hot-seat: cliques fora do turno são bloqueados
- [ ] IA executa movimentos válidos automaticamente após delay de 800ms
- [ ] IA escolhe o movimento que conquista mais peças (greedy)
- [ ] Jogo termina normalmente em ambos os modos
