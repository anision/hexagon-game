# M4 — Interface do Jogo (Frontend Canvas)

## Problem Statement

Com o motor do jogo pronto (M3), é preciso tornar o Hexagon visualmente jogável no browser. A interface deve renderizar o tabuleiro hexagonal, responder aos cliques do jogador, destacar movimentos válidos e comunicar o estado do jogo de forma clara. Tudo isso usando HTML5 Canvas, sem frameworks de UI.

## Goals

- [ ] Tabuleiro hexagonal renderizado corretamente no Canvas com todas as 61 células
- [ ] Jogador consegue selecionar peça e executar movimentos com cliques
- [ ] Interface reflete em tempo real: turno, contagem de peças e fim de jogo

## Out of Scope

| Feature | Reason |
|---|---|
| IA / jogador computador | Escopo do M5 |
| Animações complexas (tweening, partículas) | Pós-v1 |
| Efeitos sonoros | Pós-v1 |
| Suporte a touch/mobile nativo | Pós-v1 |
| Temas visuais customizáveis | Pós-v1 |

---

## User Stories

### P1: Renderização do tabuleiro no Canvas ⭐ MVP

**User Story**: Como jogador, quero ver o tabuleiro hexagonal desenhado na tela para entender o espaço de jogo.

**Why P1**: Sem renderização, o jogo não existe visualmente.

**Acceptance Criteria**:

1. WHEN a página do jogo carrega THEN o Canvas SHALL exibir um tabuleiro hexagonal com 61 células hexagonais
2. WHEN o tabuleiro é renderizado THEN cada célula SHALL ter bordas visíveis e espaçamento consistente
3. WHEN o tabuleiro é renderizado THEN as peças do Player 1 SHALL ser exibidas em azul e as do Player 2 em vermelho
4. WHEN uma célula está vazia THEN ela SHALL ser exibida com fundo neutro (cinza claro)
5. WHEN a janela do browser é redimensionada THEN o Canvas SHALL reajustar a escala do tabuleiro mantendo as proporções

**Independent Test**: Carregar o jogo no browser e verificar visualmente que as 61 células aparecem com as 6 peças iniciais nas posições corretas.

---

### P1: Seleção de peça com clique ⭐ MVP

**User Story**: Como jogador, quero clicar em uma das minhas peças para selecioná-la e ver os movimentos possíveis destacados.

**Why P1**: É o primeiro passo de qualquer jogada.

**Acceptance Criteria**:

1. WHEN o jogador clica em uma de suas peças THEN a peça SHALL ser destacada visualmente (borda brilhante ou cor diferente)
2. WHEN uma peça é selecionada THEN todas as casas de movimento curto válidas SHALL ser destacadas em verde claro
3. WHEN uma peça é selecionada THEN todas as casas de movimento longo válidas SHALL ser destacadas em amarelo claro
4. WHEN o jogador clica em outra de suas peças THEN a seleção SHALL mudar para a nova peça
5. WHEN o jogador clica em uma célula sem peça própria e sem peça selecionada THEN nada SHALL acontecer
6. WHEN o jogador clica fora do tabuleiro THEN nada SHALL acontecer

**Independent Test**: Clicar em uma peça → verificar highlight da peça selecionada e das casas válidas.

---

### P1: Execução de movimento com clique ⭐ MVP

**User Story**: Como jogador, quero clicar em uma casa destacada para executar o movimento e ver o resultado imediatamente no tabuleiro.

**Why P1**: É a ação central do jogo.

**Acceptance Criteria**:

1. WHEN o jogador clica em uma casa de movimento curto destacada THEN o motor SHALL executar `move_short` e o Canvas SHALL atualizar mostrando a nova peça
2. WHEN o jogador clica em uma casa de movimento longo destacada THEN o motor SHALL executar `move_long` e o Canvas SHALL atualizar com a peça na nova posição e a origem vazia
3. WHEN um movimento é executado THEN as peças conquistadas SHALL mudar de cor instantaneamente no Canvas
4. WHEN um movimento é executado THEN o highlight de seleção e casas válidas SHALL ser removido
5. WHEN o jogador clica em uma casa não destacada após selecionar uma peça THEN o movimento SHALL ser cancelado e o highlight removido

**Independent Test**: Selecionar peça → clicar em casa válida → verificar que o tabuleiro atualiza com peça na nova posição e conquistas aplicadas.

---

### P1: Indicador de turno atual ⭐ MVP

**User Story**: Como jogador, quero saber claramente de quem é a vez para não cometer erros.

**Why P1**: Sem indicador de turno, o jogo é confuso, especialmente no modo hot-seat.

**Acceptance Criteria**:

1. WHEN é a vez do Player 1 THEN a interface SHALL exibir "Vez do Jogador 1" com a cor azul
2. WHEN é a vez do Player 2 THEN a interface SHALL exibir "Vez do Jogador 2" com a cor vermelha
3. WHEN o turno muda após um movimento THEN o indicador SHALL atualizar imediatamente

**Independent Test**: Executar um movimento e verificar que o indicador de turno muda.

---

### P1: Placar em tempo real ⭐ MVP

**User Story**: Como jogador, quero ver quantas peças cada jogador tem no tabuleiro para acompanhar quem está ganhando.

**Why P1**: O placar é parte essencial da experiência de jogo.

**Acceptance Criteria**:

1. WHEN o jogo está em andamento THEN a interface SHALL exibir a contagem de peças de cada jogador
2. WHEN um movimento é executado e peças são conquistadas THEN o placar SHALL atualizar imediatamente
3. WHEN o jogo inicia THEN o placar SHALL mostrar 3 x 3

**Independent Test**: Executar um movimento que conquista peças e verificar que o placar atualiza corretamente.

---

### P1: Tela de fim de jogo ⭐ MVP

**User Story**: Como jogador, quero ver uma tela de resultado ao final da partida indicando quem ganhou.

**Why P1**: Sem fim de jogo visual, o jogador não sabe quando a partida terminou.

**Acceptance Criteria**:

1. WHEN `is_game_over()` retorna `True` THEN a interface SHALL exibir uma sobreposição (overlay) com o resultado
2. WHEN Player 1 vence THEN o overlay SHALL exibir "Jogador 1 venceu!" com o placar final
3. WHEN Player 2 vence THEN o overlay SHALL exibir "Jogador 2 venceu!" com o placar final
4. WHEN há empate THEN o overlay SHALL exibir "Empate!" com o placar final
5. WHEN o overlay de fim de jogo é exibido THEN SHALL haver um botão "Jogar novamente" que reinicia a partida

**Independent Test**: Preencher o tabuleiro artificialmente e verificar que o overlay de fim de jogo aparece com o resultado correto.

---

### P2: Animação de movimento

**User Story**: Como jogador, quero ver uma animação suave ao mover peças para tornar o jogo mais agradável visualmente.

**Why P2**: Melhora a experiência, mas o jogo é funcional sem animação.

**Acceptance Criteria**:

1. WHEN uma peça se move THEN SHALL haver uma animação de transição de ~200ms
2. WHEN peças são conquistadas THEN SHALL haver um flash visual de ~150ms nas peças convertidas

**Independent Test**: Executar um movimento e verificar visualmente que há animação.

---

### P2: Highlight de última jogada

**User Story**: Como jogador, quero ver destacada a última jogada do oponente para entender o que aconteceu.

**Why P2**: Útil para entender o estado do jogo, especialmente no modo hot-seat.

**Acceptance Criteria**:

1. WHEN o turno passa para o próximo jogador THEN as células envolvidas no último movimento (origem e destino) SHALL ficar com borda destacada até a próxima jogada

**Independent Test**: Executar um movimento e verificar que origem e destino ficam marcados até a próxima jogada.

---

## Edge Cases

- WHEN o Canvas não é suportado pelo browser THEN a página SHALL exibir mensagem "Seu browser não suporta Canvas. Atualize para jogar."
- WHEN o jogador clica rapidamente em múltiplas células durante uma animação THEN o sistema SHALL ignorar cliques até a animação terminar
- WHEN a janela tem menos de 600px de largura THEN o Canvas SHALL escalar o tabuleiro para caber na tela sem overflow horizontal

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| UI-01 | Renderização do tabuleiro 61 células | Tasks | Pending |
| UI-02 | Cores por jogador (azul/vermelho) | Tasks | Pending |
| UI-03 | Reescala ao redimensionar janela | Tasks | Pending |
| UI-04 | Seleção de peça com highlight | Tasks | Pending |
| UI-05 | Highlight de movimentos válidos (verde/amarelo) | Tasks | Pending |
| UI-06 | Execução de movimento curto via clique | Tasks | Pending |
| UI-07 | Execução de movimento longo via clique | Tasks | Pending |
| UI-08 | Atualização visual de conquistas | Tasks | Pending |
| UI-09 | Indicador de turno | Tasks | Pending |
| UI-10 | Placar em tempo real | Tasks | Pending |
| UI-11 | Overlay de fim de jogo com resultado | Tasks | Pending |
| UI-12 | Botão "Jogar novamente" | Tasks | Pending |
| UI-13 | Animação de movimento (~200ms) | Tasks | Pending |
| UI-14 | Highlight de última jogada | Tasks | Pending |

**Coverage:** 14 requisitos, 0 mapeados para tasks, 14 pendentes ⚠️

---

## Success Criteria

- [ ] Tabuleiro com 61 células visível no browser
- [ ] Clique em peça exibe highlight de movimentos válidos
- [ ] Movimento executado atualiza tabuleiro, placar e turno
- [ ] Conquistas refletem na cor das peças imediatamente
- [ ] Fim de jogo exibe overlay com vencedor e botão de reinício
