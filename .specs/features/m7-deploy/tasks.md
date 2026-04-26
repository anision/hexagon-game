# M7 — Tasks: Polimento e Deploy

## O que já está pronto (carry-forward)
- Paleta de cores definida e aplicada em style.css (DEPLOY-01 ✅)
- Fonte Inter carregada via Google Fonts em todas as páginas (DEPLOY-02 ✅)
- Hover states em btns principais (DEPLOY-03 parcial)
- `resizeCanvas` e listener de `resize` no window (DEPLOY-04 parcial)

---

## Plano de execução

```
T1 (visual polish) → T2 (toast) → T3 (config + prod docker) → T4 (README + 404)
     sequencial           sequencial        sequencial                sequencial
```

---

## T1 — Polimento visual + aviso mobile

**Refs:** DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04, DEPLOY-05

**What:**
- Mover estilos inline do `login.html` para `style.css`
- Adicionar estado `disabled` a todos os botões
- Adicionar `#mobile-warning` em `index.html` — visível apenas em telas < 600px via CSS
- Garantir `max-width: 100%` no canvas para escalar em telas menores

**Where:**
- `frontend/css/style.css`
- `frontend/login.html`
- `frontend/index.html`

**Done when:**
- Todas as telas têm estilos centralizados em CSS
- Botão desabilitado visualmente diferente do normal
- Em viewport < 600px, aviso aparece sobre o canvas

---

## T2 — Sistema de toast para erros

**Refs:** DEPLOY-06, DEPLOY-07

**What:**
- Adicionar `showToast(msg, type)` global em `auth.js` (evita arquivo extra)
- Estilos do toast em `style.css`
- `fetchWithAuth` mostra toast em erro de rede e HTTP 500
- Na 401, exibe "Sua sessão expirou. Fazendo login novamente..." antes de redirecionar (delay 1.5s)
- Auto-dismiss em 4s

**Where:**
- `frontend/js/auth.js`
- `frontend/css/style.css`

**Done when:**
- Desligando o backend, toasts de erro aparecem ao tentar qualquer ação de rede
- Token inválido → toast "Sessão expirada" → redirect após 1.5s

---

## T3 — Config.js + Docker Compose produção

**Refs:** DEPLOY-08, DEPLOY-09

**What:**
- `frontend/config.js` — define `window.BACKEND_URL = 'http://localhost:8000'` em dev
- Todos os HTMLs carregam `config.js` antes de `auth.js`
- `auth.js` usa `window.BACKEND_URL !== undefined ? window.BACKEND_URL : 'http://localhost:8000'`
- `nginx/nginx.conf` — serve estáticos + proxy `/api/`, `/auth/`, `/health` para backend
  - Em produção, `config.js` é interceptado pelo nginx e retorna `window.BACKEND_URL = ""`
- `docker-compose.prod.yml` — postgres + backend (Gunicorn 2 workers) + nginx
- `gunicorn` adicionado ao `requirements.txt`

**Where:**
- `frontend/config.js` (novo)
- `frontend/*.html` (add script tag)
- `nginx/nginx.conf` (novo)
- `docker-compose.prod.yml` (novo)
- `backend/requirements.txt`

**Done when:**
- `docker compose -f docker-compose.prod.yml up --build` sobe sem erros
- Frontend acessível via `http://localhost:80`, backend proxiado pelo nginx

---

## T4 — README Deploy + página 404

**Refs:** DEPLOY-10, DEPLOY-11

**What:**
- README.md: substituir placeholder de deploy por seção real com pré-requisitos, configuração de `.env`, comandos e observações sobre Google OAuth2 em produção
- `frontend/404.html` — página de erro amigável com link para início
- `nginx/nginx.conf` usa `error_page 404 /404.html`

**Where:**
- `README.md`
- `frontend/404.html` (novo)
- `nginx/nginx.conf` (atualizar)

**Done when:**
- Seção Deploy no README cobre todos os passos do zero
- `/rota-inexistente` no browser mostra a página 404 customizada

---

## Rastreabilidade

| Req | Task |
|---|---|
| DEPLOY-01 | T1 |
| DEPLOY-02 | T1 |
| DEPLOY-03 | T1 |
| DEPLOY-04 | T1 |
| DEPLOY-05 | T1 |
| DEPLOY-06 | T2 |
| DEPLOY-07 | T2 |
| DEPLOY-08 | T3 |
| DEPLOY-09 | T3 |
| DEPLOY-10 | T4 |
| DEPLOY-11 | T4 |
