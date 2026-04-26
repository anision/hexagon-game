# Hexagon

**Vision:** Versão web do clássico jogo de tabuleiro hexagonal onde dois jogadores disputam o controle do tabuleiro duplicando e conquistando peças do oponente.
**For:** Qualquer pessoa com acesso a um browser e conta Google.
**Solves:** Oferecer uma experiência de jogo estratégico acessível no browser, com suporte a partidas contra o computador ou contra outro jogador, registro de jogadores via Google SSO e histórico de recordes.

---

## Goals

- Entregar um jogo 100% funcional no browser com as regras completas do Hexagon
- Suportar os modos Jogador x Computador e Jogador x Jogador
- Permitir cadastro e login via Google SSO sem fricção
- Registrar e exibir o histórico de recordes dos jogadores

## Tech Stack

**Core:**

- Language (Backend): Python 3.12
- Framework (Backend): FastAPI
- Language (Frontend): JavaScript (Vanilla ES2022)
- Renderização do jogo: HTML5 Canvas API
- Database: PostgreSQL 16

**Key dependencies:**

- `authlib` — Google OAuth2 / SSO
- `python-jose` — JWT para gerenciamento de sessão
- `sqlalchemy` + `alembic` — ORM e migrações
- `asyncpg` — driver PostgreSQL assíncrono
- Docker + Docker Compose — ambiente de desenvolvimento e deploy

## Scope

**v1 includes:**

- Tabuleiro hexagonal com células hexagonais (raio 4 → 61 células)
- Posições iniciais: 3 peças por jogador nos vértices alternados do tabuleiro
- Regras completas:
  - Movimento curto (1 célula): duplica a peça
  - Movimento longo (2 células, pulo): move sem duplicar
  - Conquista: peças adjacentes do oponente são convertidas
  - Fim de jogo: tabuleiro completo → mais peças vence
- Modo Jogador x Computador (IA básica)
- Modo Jogador x Jogador (mesma máquina / hot-seat)
- Cadastro e login via Google SSO
- Registro e exibição de recordes por jogador
- Interface web responsiva rodando no browser

**Explicitly out of scope:**

- Modo multiplayer online em tempo real (jogadores em máquinas diferentes)
- IA avançada / níveis de dificuldade múltiplos
- Sistema de ranking global / matchmaking
- Aplicativo mobile nativo
- Replay de partidas
- Chat entre jogadores
