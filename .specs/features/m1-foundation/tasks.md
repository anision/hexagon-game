# M1 — Fundação: Tasks

**Spec**: `.specs/features/m1-foundation/spec.md`
**Status**: Approved

> **Nota sobre testes:** Projeto greenfield — TESTING.md ainda não existe.
> Para M1 (infraestrutura), os gates são smoke tests manuais (comandos de verificação).
> TESTING.md será criado como parte do M1 (T8).

---

## Execution Plan

### Phase 1 — Estrutura Base (Sequential)
```
T1 → T2
```

### Phase 2 — Backend + Frontend (Parallel)
```
T2 ──┬── T3 [P] (backend FastAPI)
     └── T4 [P] (frontend Canvas)
```

### Phase 3 — Infraestrutura Backend (Sequential após T3)
```
T3 ──┬── T5 (Alembic)
     └── T6 (Dockerfile backend)
```

### Phase 4 — Docker Compose + Docs (Sequential)
```
T6 → T7 (docker-compose.yml)
T4, T5, T7 → T8 (README)
```

---

## Task Breakdown

### T1: Criar estrutura de pastas e arquivos base

**What**: Criar toda a hierarquia de diretórios do projeto e os arquivos de configuração raiz.
**Where**:
```
Hexagon/
├── backend/app/api/   backend/app/models/   backend/app/core/
├── backend/alembic/
├── frontend/css/   frontend/js/   frontend/assets/
├── .gitignore
└── .env.example
```
**Depends on**: None
**Reuses**: N/A
**Requirement**: FOUND-01, FOUND-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Todas as pastas listadas na spec existem
- [ ] `.gitignore` ignora: `__pycache__`, `*.pyc`, `.env`, `node_modules`, `.DS_Store`
- [ ] `.env.example` contém as variáveis: `DATABASE_URL`, `SECRET_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FRONTEND_PORT`, `BACKEND_PORT`

**Verify**: `ls -R Hexagon/` mostra a estrutura completa sem erros.

**Commit**: `chore(foundation): scaffold project directory structure`

---

### T2: Criar requirements.txt do backend

**What**: Definir todas as dependências Python do backend com versões fixas.
**Where**: `backend/requirements.txt`
**Depends on**: T1
**Reuses**: N/A
**Requirement**: FOUND-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Arquivo contém: `fastapi`, `uvicorn[standard]`, `sqlalchemy`, `alembic`, `asyncpg`, `python-jose[cryptography]`, `authlib`, `httpx`, `python-dotenv`
- [ ] Versões fixadas (ex: `fastapi==0.115.0`)

**Verify**: `pip install -r backend/requirements.txt` instala sem erros.

**Commit**: `chore(backend): add requirements.txt with pinned dependencies`

---

### T3: Criar aplicação FastAPI com endpoint /health [P]

**What**: Criar o arquivo principal do backend com configuração do FastAPI, roteador base e endpoint de health check.
**Where**: `backend/app/main.py`
**Depends on**: T2
**Reuses**: N/A
**Requirement**: FOUND-06, FOUND-07

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `backend/app/main.py` inicializa a aplicação FastAPI com título "Hexagon API"
- [ ] `GET /health` retorna `HTTP 200` com body `{"status": "ok", "service": "hexagon-api"}`
- [ ] Swagger UI acessível em `/docs` quando o servidor está rodando
- [ ] Log de inicialização exibe versão do Python e FastAPI

**Tests**: smoke
**Gate**: `curl http://localhost:8000/health` → `{"status":"ok","service":"hexagon-api"}`

**Verify**:
```bash
cd backend && uvicorn app.main:app --reload
curl http://localhost:8000/health
# Expected: {"status":"ok","service":"hexagon-api"}
```

**Commit**: `feat(backend): add FastAPI app with /health endpoint`

---

### T4: Criar frontend base com Canvas [P]

**What**: Criar a página HTML base com elemento Canvas, folha de estilos mínima e script principal.
**Where**: `frontend/index.html`, `frontend/js/main.js`, `frontend/css/style.css`
**Depends on**: T1
**Reuses**: N/A
**Requirement**: FOUND-10, FOUND-11

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `index.html` contém `<title>Hexagon</title>` e elemento `<canvas id="game-canvas" width="800" height="700">`
- [ ] `index.html` carrega `css/style.css` e `js/main.js`
- [ ] `js/main.js` obtém referência ao canvas e contexto 2D sem erros
- [ ] `js/main.js` loga `"Hexagon initialized"` no console do browser
- [ ] Página abre no browser sem erros no console

**Tests**: smoke
**Gate**: Abrir `frontend/index.html` no browser e verificar console sem erros + presença do `<canvas>`

**Verify**:
```
Abrir frontend/index.html no browser → DevTools → Console
Expected: "Hexagon initialized" (sem erros)
```

**Commit**: `feat(frontend): add base HTML page with Canvas element`

---

### T5: Configurar Alembic e criar migração inicial

**What**: Inicializar o Alembic no projeto backend e criar a primeira migração (schema vazio, apenas versão de controle).
**Where**: `backend/alembic.ini`, `backend/alembic/env.py`, `backend/alembic/versions/0001_initial.py`
**Depends on**: T3
**Reuses**: N/A
**Requirement**: FOUND-08, FOUND-09

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `alembic init` executado e `alembic.ini` configurado com `DATABASE_URL` via variável de ambiente
- [ ] `alembic/env.py` carrega `DATABASE_URL` do `.env`
- [ ] Migração `0001_initial.py` criada (upgrade/downgrade sem operações — apenas marcação de versão base)
- [ ] `alembic upgrade head` executa sem erros quando banco está disponível

**Tests**: smoke
**Gate**:
```bash
cd backend
alembic upgrade head
# Expected: "Running upgrade -> <revision>, Initial migration"
```

**Verify**:
```bash
docker compose exec db psql -U postgres -d hexagon -c "\dt"
# Expected: tabela alembic_version presente
```

**Commit**: `chore(backend): configure Alembic with initial migration`

---

### T6: Criar Dockerfile do backend

**What**: Criar o Dockerfile para containerizar o servidor FastAPI.
**Where**: `backend/Dockerfile`
**Depends on**: T3
**Reuses**: N/A
**Requirement**: FOUND-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Base image: `python:3.12-slim`
- [ ] Copia e instala `requirements.txt` antes de copiar o código (cache de layers)
- [ ] Expõe a porta `8000`
- [ ] Comando de inicialização: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- [ ] `docker build -t hexagon-backend backend/` conclui sem erros

**Tests**: smoke
**Gate**: `docker build -t hexagon-backend backend/` → exit code 0

**Verify**:
```bash
docker build -t hexagon-backend backend/
docker run --rm -e DATABASE_URL=sqlite:///test.db -p 8000:8000 hexagon-backend
curl http://localhost:8000/health
# Expected: {"status":"ok","service":"hexagon-api"}
```

**Commit**: `chore(backend): add Dockerfile`

---

### T7: Criar docker-compose.yml

**What**: Criar o arquivo Docker Compose orquestrando os serviços `db`, `backend` e `frontend`.
**Where**: `docker-compose.yml`
**Depends on**: T6
**Reuses**: N/A
**Requirement**: FOUND-03, FOUND-04, FOUND-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Serviço `db`: imagem `postgres:16`, healthcheck configurado, volume persistente, variáveis via `.env`
- [ ] Serviço `backend`: build de `./backend`, `depends_on: db (condition: service_healthy)`, porta `${BACKEND_PORT}:8000`
- [ ] Serviço `frontend`: imagem `nginx:alpine` servindo `./frontend`, porta `${FRONTEND_PORT}:80`
- [ ] `docker compose up` sobe os 3 serviços sem erros com `.env` preenchido a partir de `.env.example`

**Tests**: smoke
**Gate**:
```bash
cp .env.example .env
docker compose up -d
docker compose ps
# Expected: 3 serviços com status "running" ou "healthy"
```

**Verify**:
```bash
curl http://localhost:${BACKEND_PORT}/health
# Expected: {"status":"ok","service":"hexagon-api"}
open http://localhost:${FRONTEND_PORT}
# Expected: página Hexagon com canvas visível
```

**Commit**: `chore(infra): add Docker Compose with db, backend, frontend services`

---

### T8: Criar README.md com instruções de setup

**What**: Criar o README principal do projeto com instruções para subir o ambiente do zero.
**Where**: `README.md` (raiz do projeto)
**Depends on**: T4, T5, T7
**Reuses**: N/A
**Requirement**: FOUND-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] README contém: descrição do projeto, pré-requisitos (Docker + Docker Compose), passos de setup (`cp .env.example .env` → `docker compose up`), URLs de acesso (frontend, backend, swagger), comando para rodar migrações manualmente
- [ ] Um desenvolvedor sem contexto prévio consegue subir o ambiente seguindo apenas o README

**Tests**: smoke
**Gate**: Revisão manual do documento.

**Commit**: `docs: add README with setup instructions`

---

## Parallel Execution Map

```
Phase 1 (Sequential):
  T1 ──→ T2

Phase 2 (Parallel — após T2):
  T2 ──┬── T3 [P] (FastAPI /health)
       └── T4 [P] (frontend Canvas)

Phase 3 (Sequential — após T3):
  T3 ──┬── T5 (Alembic)
       └── T6 (Dockerfile)

Phase 4 (Sequential — após T6):
  T6 ──→ T7 (docker-compose.yml)

Phase 5 (Sequential — após T4, T5, T7):
  T7 + T4 + T5 ──→ T8 (README)
```

---

## Task Granularity Check

| Task | Escopo | Status |
|---|---|---|
| T1: Estrutura de pastas + .env.example + .gitignore | 1 operação de scaffolding | ✅ Granular |
| T2: requirements.txt | 1 arquivo | ✅ Granular |
| T3: FastAPI main.py + /health | 1 arquivo, 1 endpoint | ✅ Granular |
| T4: index.html + main.js + style.css | 3 arquivos coesos (1 página) | ✅ OK (coesos) |
| T5: Alembic config + migração inicial | 1 setup + 1 arquivo de migração | ✅ Granular |
| T6: Dockerfile backend | 1 arquivo | ✅ Granular |
| T7: docker-compose.yml | 1 arquivo | ✅ Granular |
| T8: README.md | 1 documento | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagrama mostra | Status |
|---|---|---|---|
| T1 | None | Início da Phase 1 | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 [P] | ✅ Match |
| T4 | T1 | T2 → T4 [P] | ✅ Match |
| T5 | T3 | T3 → T5 | ✅ Match |
| T6 | T3 | T3 → T6 | ✅ Match |
| T7 | T6 | T6 → T7 | ✅ Match |
| T8 | T4, T5, T7 | T7 + T4 + T5 → T8 | ✅ Match |

---

## Test Co-location Validation

> TESTING.md não existe ainda (greenfield). Gates para M1 são smoke tests manuais.

| Task | Camada criada | Gate | Status |
|---|---|---|---|
| T1 | Arquivos de config | manual | ✅ OK |
| T2 | requirements.txt | manual (pip install) | ✅ OK |
| T3 | FastAPI endpoint | smoke (curl) | ✅ OK |
| T4 | HTML/JS frontend | smoke (browser) | ✅ OK |
| T5 | Alembic migration | smoke (alembic upgrade) | ✅ OK |
| T6 | Dockerfile | smoke (docker build) | ✅ OK |
| T7 | docker-compose.yml | smoke (docker compose up) | ✅ OK |
| T8 | README | revisão manual | ✅ OK |

---

## Requirement Traceability Update

| Requirement ID | Story | Task | Status |
|---|---|---|---|
| FOUND-01 | Estrutura de pastas | T1, T2 | Pending |
| FOUND-02 | README com instruções | T8 | Pending |
| FOUND-03 | Docker Compose 3 serviços | T6, T7 | Pending |
| FOUND-04 | Health check Docker (depends_on) | T7 | Pending |
| FOUND-05 | `.env.example` funcional | T1, T7 | Pending |
| FOUND-06 | `GET /health` retorna 200 | T3 | Pending |
| FOUND-07 | Swagger UI em `/docs` | T3 | Pending |
| FOUND-08 | Alembic configurado | T5 | Pending |
| FOUND-09 | Auto-migração na inicialização | T5 | Pending |
| FOUND-10 | Página HTML base com `<canvas>` | T4 | Pending |
| FOUND-11 | `js/main.js` carregado sem erros | T4 | Pending |

**Coverage:** 11 requisitos, 11 mapeados para tasks ✅
