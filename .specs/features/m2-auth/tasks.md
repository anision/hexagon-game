# M2 — Autenticação: Tasks

**Spec**: `.specs/features/m2-auth/spec.md`
**Status**: Done

> **Testes:** JWT utility terá testes unitários (pytest). OAuth flow e frontend usam smoke tests manuais — o fluxo completo exige credenciais Google reais.

---

## Execution Plan

### Phase 1 — Modelo de dados (Sequential)
```
T1 (User model + migration)
```

### Phase 2 — JWT + Login page (Parallel)
```
T1 ──┬── T2 [P] (JWT utility + unit tests)
     └── T6 [P] (login.html)
```

### Phase 3 — Auth dependency (Sequential após T2)
```
T2 → T3 (get_current_user dependency)
```

### Phase 4 — Rotas e endpoint /me (Parallel após T3)
```
T3 ──┬── T4 [P] (OAuth routes /auth/google + /auth/callback)
     └── T5 [P] (GET /api/players/me)
```

### Phase 5 — Frontend auth module (Sequential após T6)
```
T6 → T7 (auth.js — token storage + redirect)
```

### Phase 6 — Wiring final (Sequential após T4, T5, T7)
```
T4 + T5 + T7 → T8 (atualizar index.html com verificação de sessão e perfil)
```

---

## Task Breakdown

### T1: Criar modelo User e migração 0002_users

**What**: Definir o modelo SQLAlchemy `User` e criar a migração Alembic correspondente.
**Where**: `backend/app/models/user.py`, `backend/alembic/versions/0002_users.py`
**Depends on**: M1 completo
**Requirement**: AUTH-04, AUTH-05

**Done when**:
- [ ] `User` model com campos: `id` (UUID PK), `google_id` (str, unique, indexed), `name` (str), `email` (str, unique), `avatar_url` (str, nullable), `created_at` (datetime)
- [ ] Migração `0002_users` cria a tabela `users` com os campos acima
- [ ] `backend/app/models/__init__.py` exporta `User`

**Tests**: none (config/entity)
**Gate**: smoke — `alembic upgrade head` sem erros (requer banco rodando)

**Commit**: `feat(auth): add User model and users table migration`

---

### T2: Criar utilitário JWT (emissão e validação) [P]

**What**: Módulo puro para gerar e validar JWT de sessão, com expiração de 7 dias.
**Where**: `backend/app/core/security.py`
**Depends on**: T1
**Requirement**: AUTH-03

**Done when**:
- [ ] `create_access_token(data: dict) -> str` gera JWT assinado com `SECRET_KEY`, expira em 7 dias
- [ ] `decode_access_token(token: str) -> dict` valida assinatura e expiração; lança `HTTPException 401` se inválido ou expirado
- [ ] Mensagem de erro para token expirado: `{"detail": "Token expirado"}`
- [ ] Testes unitários passando (ver abaixo)

**Tests**: unit
**Gate**: `cd backend && python -m pytest tests/test_security.py -v`

**Verify**:
```
3 testes passando:
- test_create_and_decode_token
- test_expired_token_raises_401
- test_invalid_token_raises_401
```

**Commit**: `feat(auth): add JWT utility with unit tests`

---

### T3: Criar dependência de autenticação get_current_user

**What**: FastAPI `Depends` que extrai e valida o JWT do header `Authorization: Bearer <token>` e retorna o usuário do banco.
**Where**: `backend/app/core/deps.py`
**Depends on**: T2
**Requirement**: AUTH-06

**Done when**:
- [ ] `get_current_user(token, db)` extrai token do header Bearer, valida com `decode_access_token`, busca usuário no banco pelo `google_id` do payload
- [ ] WHEN token ausente ou inválido THEN retorna `HTTP 401`
- [ ] WHEN `google_id` do payload não existe no banco THEN retorna `HTTP 401`

**Tests**: none
**Gate**: smoke — verificado indiretamente via T5

**Commit**: `feat(auth): add get_current_user FastAPI dependency`

---

### T4: Criar rotas OAuth2 Google [P]

**What**: Endpoints `/auth/google` (inicia OAuth) e `/auth/callback` (processa retorno do Google e emite JWT).
**Where**: `backend/app/api/auth.py`, registrar em `backend/app/main.py`
**Depends on**: T1, T3
**Requirement**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05

**Done when**:
- [ ] `GET /auth/google` redireciona para URL de autorização do Google OAuth2 (scopes: `openid email profile`)
- [ ] `GET /auth/callback?code=...` troca o `code` por token Google, obtém perfil do usuário, faz upsert na tabela `users` (cria se não existe, retorna existente se `google_id` já cadastrado)
- [ ] Após upsert, emite JWT com payload `{"sub": google_id}` e redireciona para `/?token=<jwt>`
- [ ] WHEN Google retorna erro THEN redireciona para `/?error=login_cancelled`

**Tests**: smoke
**Gate**: smoke — fluxo completo testável apenas com credenciais Google reais

**Commit**: `feat(auth): add Google OAuth2 routes`

---

### T5: Criar endpoint GET /api/players/me [P]

**What**: Endpoint autenticado que retorna o perfil do jogador atual.
**Where**: `backend/app/api/players.py`, registrar em `backend/app/main.py`
**Depends on**: T3
**Requirement**: AUTH-06, AUTH-08

**Done when**:
- [ ] `GET /api/players/me` usa `get_current_user` e retorna `{id, name, email, avatar_url}`
- [ ] WHEN sem token THEN retorna `HTTP 401`
- [ ] Rota registrada com prefixo `/api`

**Tests**: smoke
**Gate**: `curl -H "Authorization: Bearer <token>" http://localhost:8000/api/players/me`

**Commit**: `feat(auth): add GET /api/players/me endpoint`

---

### T6: Criar tela de login (login.html) [P]

**What**: Página HTML dedicada de login com botão "Entrar com Google".
**Where**: `frontend/login.html`
**Depends on**: T1 (independente do backend)
**Requirement**: AUTH-01

**Done when**:
- [ ] `login.html` exibe título "Hexagon" e botão "Entrar com Google"
- [ ] Botão linka para `/auth/google` (URL do backend)
- [ ] Estilo consistente com `css/style.css` (mesma paleta)
- [ ] Mensagem de erro visível quando URL contém `?error=login_cancelled`

**Tests**: smoke
**Gate**: Abrir `login.html` no browser e verificar visual + botão presente

**Commit**: `feat(frontend): add login page with Google SSO button`

---

### T7: Criar módulo auth.js (gestão de token + redirecionamento)

**What**: Módulo JavaScript que gerencia o token JWT no `localStorage`, expõe helpers de auth e intercepta respostas 401.
**Where**: `frontend/js/auth.js`
**Depends on**: T6
**Requirement**: AUTH-07, AUTH-09

**Done when**:
- [ ] `Auth.getToken()` lê token do `localStorage`
- [ ] `Auth.setToken(token)` salva token no `localStorage`
- [ ] `Auth.logout()` remove token e redireciona para `login.html`
- [ ] `Auth.isLoggedIn()` retorna `true` se token existe (sem validar assinatura no client)
- [ ] `Auth.fetchWithAuth(url, options)` adiciona header `Authorization: Bearer <token>` e redireciona para login se receber `401`

**Tests**: smoke
**Gate**: Verificar manualmente no console do browser

**Commit**: `feat(frontend): add auth.js with token management`

---

### T8: Atualizar index.html — verificação de sessão e exibição de perfil

**What**: Atualizar `index.html` e `main.js` para: capturar token da URL após callback, redirecionar para login se não autenticado, exibir nome e avatar do jogador no header.
**Where**: `frontend/index.html`, `frontend/js/main.js`
**Depends on**: T4, T5, T7
**Requirement**: AUTH-07, AUTH-08, AUTH-09

**Done when**:
- [ ] `main.js` ao carregar: se URL contém `?token=`, salva via `Auth.setToken()` e limpa a URL com `history.replaceState`
- [ ] `main.js` ao carregar: se `!Auth.isLoggedIn()` redireciona para `login.html`
- [ ] `main.js` chama `GET /api/players/me` e exibe nome e avatar no `#game-header`
- [ ] Botão "Sair" no header chama `Auth.logout()`
- [ ] WHEN avatar não carrega THEN exibe div com iniciais do jogador

**Tests**: smoke
**Gate**: Abrir jogo no browser, verificar redirecionamento para login e exibição de perfil após auth

**Commit**: `feat(frontend): add session check and player profile display`

---

## Parallel Execution Map

```
Phase 1 (Sequential):
  T1

Phase 2 (Parallel — após T1):
  T1 ──┬── T2 [P] (JWT)
       └── T6 [P] (login.html)

Phase 3 (Sequential — após T2):
  T2 → T3

Phase 4 (Parallel — após T3):
  T3 ──┬── T4 [P] (OAuth routes)
       └── T5 [P] (/me endpoint)

Phase 5 (Sequential — após T6):
  T6 → T7

Phase 6 (Sequential — após T4, T5, T7):
  T4 + T5 + T7 → T8
```

---

## Task Granularity Check

| Task | Escopo | Status |
|---|---|---|
| T1: User model + migração | 1 modelo + 1 migration | ✅ Granular |
| T2: JWT utility + testes | 1 módulo + testes colocados | ✅ Granular |
| T3: get_current_user | 1 função/dependência | ✅ Granular |
| T4: OAuth routes | 2 endpoints coesos (1 fluxo) | ✅ OK (coesos) |
| T5: /api/players/me | 1 endpoint | ✅ Granular |
| T6: login.html | 1 página | ✅ Granular |
| T7: auth.js | 1 módulo JS | ✅ Granular |
| T8: index.html + main.js | 2 arquivos coesos (wiring) | ✅ OK (coesos) |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagrama mostra | Status |
|---|---|---|---|
| T1 | M1 completo | Início Phase 1 | ✅ Match |
| T2 | T1 | T1 → T2 [P] | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T1, T3 | T3 → T4 [P] | ✅ Match |
| T5 | T3 | T3 → T5 [P] | ✅ Match |
| T6 | T1 (independente) | T1 → T6 [P] | ✅ Match |
| T7 | T6 | T6 → T7 | ✅ Match |
| T8 | T4, T5, T7 | T4+T5+T7 → T8 | ✅ Match |

---

## Test Co-location Validation

| Task | Camada criada | Gate | Status |
|---|---|---|---|
| T1 | SQLAlchemy model + migration | smoke | ✅ OK |
| T2 | JWT utility (lógica pura) | unit (pytest) | ✅ OK |
| T3 | FastAPI dependency | smoke | ✅ OK |
| T4 | OAuth endpoints | smoke | ✅ OK |
| T5 | REST endpoint | smoke | ✅ OK |
| T6 | HTML page | smoke (browser) | ✅ OK |
| T7 | JS module | smoke (browser console) | ✅ OK |
| T8 | Frontend wiring | smoke (browser) | ✅ OK |

---

## Requirement Traceability Update

| Requirement ID | Story | Task | Status |
|---|---|---|---|
| AUTH-01 | Tela de login com botão Google | T6 | Pending |
| AUTH-02 | Redirecionamento OAuth2 | T4 | Pending |
| AUTH-03 | Callback e emissão de JWT | T2, T4 | Pending |
| AUTH-04 | Criação automática de perfil | T1, T4 | Pending |
| AUTH-05 | Reutilização de perfil existente | T1, T4 | Pending |
| AUTH-06 | Proteção de endpoints via JWT | T3, T5 | Pending |
| AUTH-07 | Redirecionamento frontend em 401 | T7, T8 | Pending |
| AUTH-08 | Exibição de avatar e nome | T5, T8 | Pending |
| AUTH-09 | Logout e remoção de token | T7, T8 | Pending |

**Coverage:** 9 requisitos, 9 mapeados para tasks ✅
