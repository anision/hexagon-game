# M6 — Recordes

## Problem Statement

Após cada partida, o resultado precisa ser registrado para que os jogadores possam acompanhar seu histórico e comparar desempenhos. Sem registro de recordes, o jogo perde longevidade — não há motivação para jogar novamente. O sistema deve salvar resultados automaticamente e exibir um histórico simples por jogador.

## Goals

- [ ] Resultado de cada partida salvo automaticamente ao final
- [ ] Jogador pode consultar seu histórico de partidas
- [ ] Jogador pode ver seu desempenho (vitórias, derrotas, empates)

## Out of Scope

| Feature | Reason |
|---|---|
| Ranking global entre todos os jogadores | Pós-v1 |
| Replay de partidas | Pós-v1 |
| Estatísticas avançadas (média de peças, tempo por turno) | Pós-v1 |
| Notificações de recorde batido | Pós-v1 |
| Comparação entre jogadores | Pós-v1 |

---

## User Stories

### P1: Registro automático de partida ⭐ MVP

**User Story**: Como sistema, quero salvar o resultado de cada partida automaticamente ao final para manter um histórico confiável sem depender do jogador.

**Why P1**: Se o registro é manual (o jogador precisa fazer algo), ele pode ser ignorado. O registro automático garante integridade do histórico.

**Acceptance Criteria**:

1. WHEN `is_game_over()` retorna `True` THEN o sistema SHALL enviar automaticamente uma requisição `POST /api/games` com: `player1_id`, `player2_id` (ou `null` se for IA), `winner_id` (ou `null` em empate), `score_player1`, `score_player2`, `mode` (`pvp` ou `pvc`), `played_at`
2. WHEN a requisição de registro é bem-sucedida THEN o sistema SHALL retornar `HTTP 201` com o `game_id` gerado
3. WHEN o jogador está autenticado e o jogo termina THEN o registro SHALL ocorrer antes de exibir o overlay de fim de jogo
4. WHEN o registro falha (erro de rede) THEN o overlay de fim de jogo SHALL ser exibido mesmo assim, com aviso sutil "Não foi possível salvar o resultado"

**Independent Test**: Concluir uma partida e verificar no banco que um registro na tabela `games` foi criado com os dados corretos.

---

### P1: Modelo de dados de partidas ⭐ MVP

**User Story**: Como banco de dados, quero uma tabela de partidas bem estruturada para armazenar o histórico de forma consultável.

**Why P1**: Sem schema correto, as queries de histórico e estatísticas não são possíveis.

**Acceptance Criteria**:

1. WHEN a migração M6 é aplicada THEN a tabela `games` SHALL existir com os campos:
   - `id` (UUID, PK)
   - `player1_id` (FK → users, NOT NULL)
   - `player2_id` (FK → users, NULLABLE — null = IA)
   - `winner_id` (FK → users, NULLABLE — null = empate ou IA venceu)
   - `score_player1` (INTEGER, NOT NULL)
   - `score_player2` (INTEGER, NOT NULL)
   - `mode` (ENUM: `pvp`, `pvc`)
   - `played_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)
2. WHEN `player2_id` é NULL THEN o modo SHALL ser `pvc`

**Independent Test**: Aplicar migração e verificar schema da tabela com `\d games` no psql.

---

### P1: Endpoint de histórico do jogador ⭐ MVP

**User Story**: Como jogador, quero consultar meu histórico de partidas via API para que o frontend possa exibi-lo.

**Why P1**: Sem endpoint, o frontend não pode mostrar o histórico.

**Acceptance Criteria**:

1. WHEN `GET /api/players/me/games` é chamado com JWT válido THEN SHALL retornar lista das últimas 20 partidas do jogador autenticado, ordenadas por `played_at` decrescente
2. WHEN a lista é retornada THEN cada item SHALL conter: `game_id`, `opponent_name` (ou "Computador"), `result` (`win`/`loss`/`draw`), `score_player`, `score_opponent`, `mode`, `played_at`
3. WHEN o jogador não tem partidas THEN SHALL retornar lista vazia `[]`
4. WHEN o JWT está ausente ou inválido THEN SHALL retornar `HTTP 401`

**Independent Test**: Fazer login → jogar uma partida → chamar `GET /api/players/me/games` → verificar que a partida aparece na lista.

---

### P1: Endpoint de estatísticas do jogador ⭐ MVP

**User Story**: Como jogador, quero ver um resumo do meu desempenho (vitórias, derrotas, empates) para saber se estou melhorando.

**Why P1**: Estatísticas básicas são o mínimo de valor que um sistema de recordes oferece.

**Acceptance Criteria**:

1. WHEN `GET /api/players/me/stats` é chamado com JWT válido THEN SHALL retornar:
   - `total_games`: total de partidas jogadas
   - `wins`: número de vitórias
   - `losses`: número de derrotas
   - `draws`: número de empates
   - `win_rate`: porcentagem de vitórias (0–100, arredondado para 1 decimal)
2. WHEN o jogador não tem partidas THEN SHALL retornar todos os valores em 0 e `win_rate: 0`

**Independent Test**: Jogar 3 partidas (2 vitórias, 1 derrota) → chamar `/api/players/me/stats` → verificar `wins: 2`, `losses: 1`, `win_rate: 66.7`.

---

### P2: Tela de recordes no frontend

**User Story**: Como jogador, quero ver meu histórico e estatísticas diretamente na interface do jogo para não precisar usar ferramentas externas.

**Why P2**: Agrega valor à experiência, mas o sistema de recordes já funciona via API sem isso.

**Acceptance Criteria**:

1. WHEN o jogador clica em "Meus Recordes" na interface THEN o sistema SHALL exibir uma tela com as estatísticas resumidas (vitórias/derrotas/empates) e a lista das últimas 20 partidas
2. WHEN a lista de partidas é exibida THEN cada linha SHALL mostrar: data, oponente, resultado (V/D/E), placar
3. WHEN os dados estão carregando THEN a interface SHALL exibir um indicador de loading
4. WHEN há erro ao carregar THEN a interface SHALL exibir "Não foi possível carregar os recordes. Tente novamente."

**Independent Test**: Clicar em "Meus Recordes" → verificar que as estatísticas e histórico são exibidos corretamente.

---

## Edge Cases

- WHEN o jogador fecha o browser antes do fim de jogo THEN nenhum registro SHALL ser criado (partida incompleta não conta)
- WHEN a IA vence THEN `winner_id` SHALL ser NULL e o resultado do humano SHALL ser `loss`
- WHEN há empate THEN `winner_id` SHALL ser NULL e o resultado de ambos SHALL ser `draw`
- WHEN `score_player1 + score_player2 != 61` THEN o backend SHALL rejeitar o registro com `HTTP 422`

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| REC-01 | Registro automático ao fim da partida (frontend) | Tasks | Pending |
| REC-02 | `POST /api/games` salva partida no banco | Tasks | Pending |
| REC-03 | Tabela `games` com schema correto | Tasks | Pending |
| REC-04 | `GET /api/players/me/games` retorna histórico | Tasks | Pending |
| REC-05 | `GET /api/players/me/stats` retorna estatísticas | Tasks | Pending |
| REC-06 | Tela de recordes no frontend | Tasks | Pending |
| REC-07 | Tratamento de falha de registro (aviso sem bloquear) | Tasks | Pending |
| REC-08 | Validação: score1 + score2 == 61 | Tasks | Pending |

**Coverage:** 8 requisitos, 0 mapeados para tasks, 8 pendentes ⚠️

---

## Success Criteria

- [ ] Partida registrada no banco automaticamente ao fim do jogo
- [ ] `GET /api/players/me/games` retorna histórico correto
- [ ] `GET /api/players/me/stats` retorna estatísticas corretas (win rate calculado)
- [ ] Tela de recordes exibe dados com loading e tratamento de erro
