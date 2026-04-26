# M1 — Fundação do Projeto

## Problem Statement

Antes de qualquer funcionalidade ser desenvolvida, o projeto precisa de uma base sólida: estrutura de pastas organizada, ambiente de desenvolvimento containerizado, banco de dados configurado e servidores backend e frontend rodando e comunicando entre si. Sem essa fundação, nenhuma feature subsequente pode ser construída de forma consistente.

## Goals

- [ ] Ambiente de desenvolvimento 100% reproduzível via Docker Compose (qualquer dev sobe o projeto com um único comando)
- [ ] Backend FastAPI respondendo na porta 8000 com health check funcional
- [ ] Banco PostgreSQL acessível pelo backend com esquema inicial criado via Alembic
- [ ] Frontend (HTML + Canvas) acessível no browser em desenvolvimento

## Out of Scope

| Feature | Reason |
|---|---|
| Autenticação / login | Escopo do M2 |
| Qualquer lógica de jogo | Escopo do M3 em diante |
| Deploy em produção | Escopo do M7 |
| CI/CD pipeline | Pós-v1 |

---

## User Stories

### P1: Estrutura de pastas do projeto ⭐ MVP

**User Story**: Como desenvolvedor, quero uma estrutura de pastas clara e padronizada para que o código de backend, frontend e infra fique bem separado e fácil de navegar.

**Why P1**: Toda feature subsequente depende desta organização. Sem ela, o projeto vira caos desde o início.

**Acceptance Criteria**:

1. WHEN o repositório é clonado THEN a estrutura de pastas SHALL seguir o padrão definido abaixo:
   ```
   Hexagon/
   ├── backend/
   │   ├── app/
   │   │   ├── main.py
   │   │   ├── api/
   │   │   ├── models/
   │   │   └── core/
   │   ├── alembic/
   │   ├── requirements.txt
   │   └── Dockerfile
   ├── frontend/
   │   ├── index.html
   │   ├── css/
   │   ├── js/
   │   └── assets/
   ├── docker-compose.yml
   └── .env.example
   ```
2. WHEN um novo desenvolvedor acessa o projeto THEN SHALL existir um `README.md` com instruções de como subir o ambiente

**Independent Test**: Clonar o repositório em uma máquina limpa e verificar que todas as pastas e arquivos base existem.

---

### P1: Ambiente Docker Compose funcional ⭐ MVP

**User Story**: Como desenvolvedor, quero subir todo o ambiente de desenvolvimento com um único comando para não precisar instalar dependências manualmente na minha máquina.

**Why P1**: Reprodutibilidade é crítica para desenvolvimento em equipe e para o contexto de aula (ambientes diferentes).

**Acceptance Criteria**:

1. WHEN o comando `docker compose up` é executado na raiz do projeto THEN SHALL subir 3 serviços: `db` (PostgreSQL), `backend` (FastAPI) e `frontend` (servidor estático)
2. WHEN o serviço `backend` sobe THEN SHALL aguardar o serviço `db` estar saudável antes de iniciar (`depends_on` com healthcheck)
3. WHEN qualquer serviço falha ao subir THEN Docker SHALL exibir log de erro identificável
4. WHEN o arquivo `.env.example` é copiado para `.env` THEN o ambiente SHALL subir sem configuração adicional

**Independent Test**: Executar `docker compose up` em uma máquina com apenas Docker instalado e verificar que os 3 serviços ficam com status `healthy` ou `running`.

---

### P1: Backend FastAPI com health check ⭐ MVP

**User Story**: Como desenvolvedor, quero confirmar que o servidor backend está rodando e acessível para que eu possa desenvolver e depurar as features com confiança.

**Why P1**: Sem confirmar que o backend está de pé, nenhuma feature de API pode ser validada.

**Acceptance Criteria**:

1. WHEN o backend está rodando THEN `GET /health` SHALL retornar `HTTP 200` com body `{"status": "ok", "service": "hexagon-api"}`
2. WHEN o backend inicia THEN SHALL exibir no log a versão do Python e do FastAPI em uso
3. WHEN `GET /docs` é acessado no browser THEN SHALL exibir a interface Swagger UI com os endpoints disponíveis

**Independent Test**: Com o Docker rodando, abrir `http://localhost:8000/health` no browser e ver a resposta JSON.

---

### P1: Banco de dados PostgreSQL com migração inicial ⭐ MVP

**User Story**: Como desenvolvedor, quero o banco de dados configurado e com a migração inicial aplicada para que as features seguintes possam criar e evoluir o schema de forma controlada.

**Why P1**: Todas as features de M2 em diante dependem do banco. O Alembic precisa estar configurado desde o início.

**Acceptance Criteria**:

1. WHEN o backend sobe THEN SHALL executar automaticamente as migrações pendentes do Alembic
2. WHEN a migração inicial é aplicada THEN SHALL existir a tabela `alembic_version` no banco confirmando o controle de versão
3. WHEN a variável `DATABASE_URL` no `.env` aponta para o PostgreSQL do Docker THEN o backend SHALL conectar sem erro
4. WHEN o banco não está disponível THEN o backend SHALL registrar erro claro no log e falhar com código de saída não-zero

**Independent Test**: Conectar ao PostgreSQL via `docker compose exec db psql` e verificar que a tabela `alembic_version` existe.

---

### P1: Frontend base com Canvas configurado ⭐ MVP

**User Story**: Como desenvolvedor, quero uma página HTML base com o elemento Canvas configurado para que a renderização do tabuleiro possa ser desenvolvida a partir do M4.

**Why P1**: O frontend precisa estar acessível e com o scaffolding correto para que as features de UI não comecem do zero.

**Acceptance Criteria**:

1. WHEN `http://localhost:3000` é acessado no browser THEN SHALL exibir a página `index.html` do Hexagon
2. WHEN a página carrega THEN SHALL existir um elemento `<canvas id="game-canvas">` com dimensões iniciais definidas (ex: 800x700px)
3. WHEN a página carrega THEN SHALL carregar o arquivo `js/main.js` sem erros no console do browser
4. WHEN a página carrega THEN SHALL exibir o título "Hexagon" na página

**Independent Test**: Abrir `http://localhost:3000` no browser e inspecionar o DOM para confirmar a presença do `<canvas>` e ausência de erros no console.

---

## Edge Cases

- WHEN as portas 8000 ou 5432 já estão em uso na máquina do dev THEN o `docker-compose.yml` SHALL mapear para portas alternativas configuráveis via `.env`
- WHEN o volume do PostgreSQL já existe (dados anteriores) THEN o Docker SHALL reutilizá-lo sem apagar os dados
- WHEN a migração Alembic falha THEN o backend SHALL não subir e o log SHALL indicar qual migração falhou

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| FOUND-01 | Estrutura de pastas | Tasks | Verified |
| FOUND-02 | README com instruções | Tasks | Verified |
| FOUND-03 | Docker Compose com 3 serviços | Tasks | Verified |
| FOUND-04 | Health check do Docker (depends_on) | Tasks | Verified |
| FOUND-05 | `.env.example` funcional | Tasks | Verified |
| FOUND-06 | `GET /health` retorna 200 | Tasks | Verified |
| FOUND-07 | Swagger UI acessível em `/docs` | Tasks | Verified |
| FOUND-08 | Alembic configurado e migração inicial | Tasks | Verified |
| FOUND-09 | Auto-migração na inicialização | Tasks | Verified |
| FOUND-10 | Página HTML base com `<canvas>` | Tasks | Verified |
| FOUND-11 | `js/main.js` carregado sem erros | Tasks | Verified |

**Coverage:** 11 requisitos, 0 mapeados para tasks, 11 pendentes ⚠️

---

## Success Criteria

- [ ] `docker compose up` sobe os 3 serviços sem erro em uma máquina limpa
- [ ] `http://localhost:8000/health` retorna `{"status": "ok"}` no browser
- [ ] `http://localhost:8000/docs` exibe o Swagger UI
- [ ] Tabela `alembic_version` existe no PostgreSQL
- [ ] `http://localhost:3000` exibe a página com `<canvas>` e sem erros no console
