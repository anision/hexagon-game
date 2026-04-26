# Hexagon — State

## Decisions

- **Stack escolhida (2026-04-26):** Python + FastAPI (backend), Vanilla JS + Canvas (frontend), PostgreSQL (banco), Google OAuth2 + JWT (auth), Docker (infra). Escolha baseada em simplicidade, ampla documentação e adequação ao uso em aula.
- **Autenticação (2026-04-26):** Google SSO como único mecanismo de cadastro/login. Sem cadastro manual por formulário na v1.
- **Modo multiplayer (2026-04-26):** Hot-seat (mesma máquina) na v1. Multiplayer online em tempo real é backlog pós-v1.
- **IA (2026-04-26):** Apenas IA básica (greedy) na v1. IA é sempre Player 2. Delay de 800ms para simular "pensar". Níveis de dificuldade são backlog.
- **Paleta de cores (2026-04-26):** Background `#1a1a2e`, células `#16213e`, Player 1 `#4361ee` (azul), Player 2 `#e63946` (vermelho), movimentos curtos `#4ade80` (verde), longos `#fbbf24` (amarelo), texto `#e2e8f0`. Fonte: Inter.
- **Recordes (2026-04-26):** Partidas salvas automaticamente ao fim do jogo. Score1 + Score2 deve ser sempre 61. Histórico limitado às últimas 20 partidas por jogador.
- **Tabuleiro (2026-04-26):** Hexágono de raio 4 → 61 células hexagonais. Posições iniciais: 3 peças por jogador nos 6 vértices alternados.

## Blockers

_(nenhum registrado)_

## Todos

- [x] Especificar M1 — Fundação ✓
- [x] Implementar M1 — Fundação ✓
- [x] Especificar M2 — Autenticação Google SSO ✓
- [x] Especificar M3 — Motor do Jogo ✓
- [x] Especificar M4 — Interface Canvas ✓
- [x] Especificar M5 — Modos de Jogo ✓
- [x] Especificar M6 — Recordes ✓
- [x] Especificar M7 — Polimento e Deploy ✓
- [ ] Definir paleta de cores e identidade visual do jogo

## Deferred Ideas

- Multiplayer online em tempo real (WebSockets)
- Níveis de dificuldade da IA (Minimax / Alpha-Beta Pruning)
- Ranking global com matchmaking
- Replay de partidas
- PWA / App mobile
