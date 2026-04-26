# Hexagon

Versão web do clássico jogo de tabuleiro hexagonal onde dois jogadores disputam o controle do tabuleiro duplicando e conquistando peças do oponente.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | HTML5 + JavaScript (Vanilla) + Canvas API |
| Backend | Python 3.12 + FastAPI |
| Banco de dados | PostgreSQL 16 |
| Autenticação | Google OAuth2 + JWT |
| Infra | Docker + Docker Compose |

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) 24+
- [Docker Compose](https://docs.docker.com/compose/install/) v2+

## Setup — Desenvolvimento

### 1. Clonar o repositório

```bash
git clone https://github.com/anision/hexagon-game.git
cd hexagon-game
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e preencha as variáveis obrigatórias:

| Variável | Descrição |
|---|---|
| `SECRET_KEY` | Chave secreta longa e aleatória para JWT |
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth2 (ver abaixo) |
| `GOOGLE_CLIENT_SECRET` | Client Secret do Google OAuth2 |

> **Google OAuth2:** Acesse o [Google Cloud Console](https://console.cloud.google.com/), crie um projeto, ative a API "Google+ API" e gere credenciais OAuth 2.0 do tipo "Aplicativo Web". Adicione `http://localhost:8000/auth/callback` como URI de redirecionamento autorizado.

### 3. Subir o ambiente

```bash
docker compose up --build
```

### 4. Acessar

| Serviço | URL |
|---|---|
| Jogo (frontend) | http://localhost:3000 |
| API (backend) | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

### 5. Verificar saúde da API

```bash
curl http://localhost:8000/health
# {"status":"ok","service":"hexagon-api"}
```

## Migrações de banco de dados

As migrações rodam automaticamente na inicialização do backend. Para rodar manualmente:

```bash
docker compose exec backend alembic upgrade head
```

Para criar uma nova migração:

```bash
docker compose exec backend alembic revision --autogenerate -m "descricao"
```

## Estrutura do projeto

```
hexagon-game/
├── backend/
│   ├── app/
│   │   ├── api/          # Rotas e endpoints
│   │   ├── core/         # Configurações e utilidades
│   │   └── models/       # Modelos do banco de dados
│   ├── alembic/          # Migrações do banco
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── css/              # Estilos
│   ├── js/               # JavaScript do jogo
│   └── index.html
├── .specs/               # Planejamento spec-driven
├── docker-compose.yml
└── .env.example
```

## Deploy (Produção)

### Pré-requisitos

- Servidor Linux com [Docker](https://docs.docker.com/get-docker/) 24+ e Docker Compose v2+
- Portas 80 (HTTP) liberadas no firewall
- Credenciais Google OAuth2 configuradas para o domínio/IP de produção

### 1. Clonar o repositório no servidor

```bash
git clone https://github.com/anision/hexagon-game.git
cd hexagon-game
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com os valores de produção:

| Variável | Descrição |
|---|---|
| `SECRET_KEY` | Chave secreta longa e aleatória para JWT (mínimo 32 chars) |
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth2 |
| `GOOGLE_CLIENT_SECRET` | Client Secret do Google OAuth2 |
| `POSTGRES_PASSWORD` | Senha forte para o banco de dados |
| `ALLOWED_ORIGIN` | URL pública do servidor, ex: `http://SEU_IP` |

> **Google OAuth2 em produção:** Acesse o [Google Cloud Console](https://console.cloud.google.com/), abra as credenciais do projeto e adicione a URI de redirecionamento de produção (ex: `http://SEU_IP/auth/callback`) em "URIs de redirecionamento autorizados". O callback é gerado automaticamente pelo backend com base no host da requisição.

### 3. Subir em produção

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

O que sobe:
- **Nginx** na porta 80 — serve o frontend e faz proxy reverso para o backend
- **Backend** (FastAPI + Gunicorn com 2 workers) — não exposto externamente
- **PostgreSQL** — não exposto externamente

### 4. Acessar

```
http://SEU_IP_OU_DOMINIO/
```

### 5. Ver logs

```bash
docker compose -f docker-compose.prod.yml logs -f
```

### 6. Parar

```bash
docker compose -f docker-compose.prod.yml down
```
