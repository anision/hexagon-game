# Hexagon — Log de Desenvolvimento

> Registro das iterações entre o desenvolvedor e o assistente de IA (Claude Code)
> durante o planejamento e desenvolvimento do jogo Hexagon.
> Este arquivo serve como material didático para aula sobre desenvolvimento de jogos
> assistido por IA usando o processo Spec-Driven.

---

## Sessão 1 — 2026-04-26

### Início do projeto

**Desenvolvedor:**
> Bom dia. Gostaria de criar um projeto para o jogo que irá se chamar Hexagon e que você me ajudasse a montar o planejamento desse jogo usando o processo spec driven. Consegue me ajudar com isso?

**Assistente:**
> Bom dia! Com prazer vou te ajudar a planejar o jogo **Hexagon** usando o processo spec-driven.
>
> Antes de criar os documentos de planejamento, preciso entender melhor a visão do jogo. Vou te fazer algumas perguntas:
>
> 1. **O que é o Hexagon?** — Mecânica principal, gênero (puzzle, arcade, estratégia?), inspirações se houver.
> 2. **Para quem é?** — Público-alvo? (casual, hardcore, faixa etária, plataforma — mobile, web, desktop?)
> 3. **Qual a stack tecnológica?** — Preferência de linguagem, engine ou framework? (Unity, Godot, Pygame, JavaScript/Canvas, etc.)
> 4. **O que entra no v1?** — Núcleo mínimo jogável? E o que fica explicitamente de fora?
> 5. **Há alguma restrição importante?** — Prazo, recursos (solo dev?), limitações técnicas?

**Desenvolvedor:**
> Antes de começarmos a trabalhar gostaria que você registrasse todas as nossas iterações em um arquivo de texto para que posteriormente eu possa usar esse jogo como um exemplo para uma aula.

**Assistente:**
> Boa ideia! Vou criar um arquivo de log para registrar todas as nossas iterações.
> *(Criou o arquivo `/Hexagon/LOG.md`)*
>
> A partir de agora todas as nossas trocas serão registradas aqui.
> Podemos continuar com as perguntas de planejamento quando quiser!

---

---

### Definição do jogo e stack

**Desenvolvedor:**
> 1 - Hexagon é um jogo que começa com um grande hexágono como tabuleiro dividido em várias células hexagonais vazias. Dois jogadores, cada um começa com 3 peças intercaladas nos vértices do tabuleiro.
>
> Regras:
> a) Mover uma casa → peça se duplica (original fica, cópia vai para o destino)
> b) Mover duas casas (pulo) → peça se move sem duplicar
> c) Peças adjacentes do oponente são conquistadas (tornam-se da cor do movimentador)
> d) Jogo termina quando o tabuleiro estiver cheio
> e) Vence quem tiver mais peças
>
> 2 - Qualquer pessoa logada. Modos: Jogador x Computador e Jogador x Jogador.
>
> 3 - Sem stack definida, peço indicação.
>
> 4 - V1: jogo no browser, cadastro, modos de jogo, registro de recordes.
>
> 5 - Sem restrições.

**Assistente:**
> Stack recomendada:
> - Frontend / Jogo: HTML5 + JavaScript (Vanilla) + Canvas API
> - Backend: Python + FastAPI
> - Banco de dados: PostgreSQL
> - Autenticação: JWT
> - Deploy: Docker

**Desenvolvedor:**
> Para cadastro e autenticação gostaria que os jogadores pudessem usar o Google como SSO. Além disso está tudo OK, podemos começar a documentação.

**Assistente:**
> Stack atualizada com Google OAuth2 (SSO) + JWT para sessão.
> Criados os seguintes documentos:
> - `.specs/project/PROJECT.md` — visão, goals, stack e escopo do projeto
> - `.specs/project/ROADMAP.md` — 7 milestones (M1 a M7) + backlog pós-v1
> - `.specs/project/STATE.md` — decisões, blockers, todos e ideias adiadas

---

---

### Especificação do M1 — Fundação do Projeto

**Desenvolvedor:**
> Sim, vamos começar pelo M1.

**Assistente:**
> Criado `.specs/features/m1-foundation/spec.md` com:
> - 5 user stories (todas P1/MVP): estrutura de pastas, Docker Compose, health check, banco + Alembic, frontend base com Canvas
> - 11 requisitos rastreáveis (FOUND-01 a FOUND-11)
> - Edge cases para portas em uso, volumes existentes e falha de migração
> - Critérios de sucesso mensuráveis

---

---

### Tasks do M1 — Fundação

**Desenvolvedor:**
> Sim, pode criar.

**Assistente:**
> Criado `.specs/features/m1-foundation/tasks.md` com:
> - 8 tarefas atômicas (T1–T8) cobrindo os 11 requisitos do M1
> - Plano de execução em 5 fases com paralelismo onde possível (T3 e T4 em paralelo)
> - Validações de granularidade, diagrama e co-localização de testes (todos ✅)
> - Gates de verificação via smoke tests para cada tarefa

---

---

### Especificação das Milestones M2–M7

**Desenvolvedor:**
> Prefiro especificar as outras milestones primeiro.

**Assistente:**
> Criadas as specs de M2 a M7:
>
> - **M2** (`m2-auth/spec.md`): Login Google SSO, criação automática de perfil, proteção de rotas, logout — 9 requisitos (AUTH-01 a AUTH-09)
> - **M3** (`m3-game-engine/spec.md`): Tabuleiro 61 células, coordenadas axiais, movimentos curto/longo, conquista, turnos, fim de jogo, listagem de movimentos válidos — 11 requisitos (ENGINE-01 a ENGINE-11)
> - **M4** (`m4-game-interface/spec.md`): Renderização Canvas, seleção/highlight, execução de movimentos, placar, indicador de turno, overlay de fim de jogo — 14 requisitos (UI-01 a UI-14)
> - **M5** (`m5-game-modes/spec.md`): Tela de seleção de modo, hot-seat, IA greedy com delay 800ms — 10 requisitos (MODES-01 a MODES-10)
> - **M6** (`m6-records/spec.md`): Registro automático de partidas, tabela `games`, endpoints de histórico e estatísticas, tela de recordes — 8 requisitos (REC-01 a REC-08)
> - **M7** (`m7-deploy/spec.md`): Design com paleta definida, responsividade, tratamento de erros, docker-compose.prod.yml com Nginx + Gunicorn — 11 requisitos (DEPLOY-01 a DEPLOY-11)
>
> Total de requisitos rastreáveis: **63 requisitos** (M1: 11, M2: 9, M3: 11, M4: 14, M5: 10, M6: 8, M7: 11)

---

---

### Implementação M1 — Fundação do Projeto

**Desenvolvedor:**
> Podemos começar o desenvolvimento, por favor não se esqueça de registrar as interações e iterações no arquivo de LOG.

**Assistente:**
> Implementadas todas as 8 tasks do M1 em sequência:
>
> | Task | Entregável | Commit |
> |---|---|---|
> | T1 | Estrutura de pastas + `.env.example` | `abd1f35` |
> | T2 | `backend/requirements.txt` | `8d0e768` |
> | T3 | `backend/app/main.py` + `/health` + config | `2a5f677` |
> | T4 | `frontend/index.html` + `style.css` + `main.js` | `7080665` |
> | T5 | `alembic.ini` + `env.py` + migração `0001_initial` | `ae18a10` |
> | T6 | `backend/Dockerfile` | `d2ddcba` |
> | T7 | `docker-compose.yml` (db + backend + frontend) | `a5754b6` |
> | T8 | `README.md` com instruções de setup | `852de64` |
>
> Status do M1: **Done** ✅
> Próxima milestone: M2 — Autenticação com Google SSO

---

---

### Implementação M2 — Autenticação com Google SSO

**Desenvolvedor:**
> Podemos seguir para M2.

**Assistente:**
> Criado `tasks.md` do M2 (8 tasks, 3 fases de paralelismo) e implementado todo o M2:
>
> | Task | Entregável | Commit |
> |---|---|---|
> | T1 | `User` model + migração `0002_users` | `b1a9309` |
> | T2 | `security.py` (JWT) + 3 testes unitários | `977b768` |
> | T3 | `deps.py` (`get_current_user`) + `database.py` | `965a1a4` |
> | T4 | `api/auth.py` (`/auth/google` + `/auth/callback`) | `17182e6` |
> | T5 | `api/players.py` (`GET /api/players/me`) | `17182e6` |
> | T6 | `login.html` com botão Google + mensagem de erro | `27514d8` |
> | T7 | `auth.js` (token storage, fetchWithAuth, logout) | `2be2248` |
> | T8 | `main.js` + `index.html` (session check, perfil) | `2be2248` |
>
> Testes: 3/3 unitários (JWT) ✅ — Smoke tests: 14/14 verificações ✅
> Status do M2: **Done** ✅

---

<!-- Novas iterações serão adicionadas abaixo -->
