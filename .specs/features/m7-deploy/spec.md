# M7 — Polimento e Deploy

## Problem Statement

Com todas as funcionalidades implementadas (M1–M6), o jogo precisa estar apresentável e disponível para acesso externo. Esta milestone cobre o refinamento visual, responsividade básica, tratamento de erros na interface e a configuração de deploy usando Docker em um servidor ou plataforma cloud.

## Goals

- [ ] Interface visual consistente e agradável com CSS próprio
- [ ] Aplicação acessível em uma URL pública
- [ ] Erros tratados com feedback claro ao usuário

## Out of Scope

| Feature | Reason |
|---|---|
| CI/CD pipeline automatizado | Pós-v1 |
| CDN para assets estáticos | Pós-v1 |
| Monitoramento e alertas (Datadog, Sentry) | Pós-v1 |
| Certificado SSL (HTTPS) gerenciado pelo app | Responsabilidade do ambiente de deploy |
| Suporte completo a mobile (touch, PWA) | Pós-v1 |
| Multi-tenancy / múltiplos ambientes (staging/prod) | Pós-v1 |

---

## User Stories

### P1: Design visual consistente ⭐ MVP

**User Story**: Como jogador, quero que a interface tenha uma aparência coesa e agradável para que o jogo pareça um produto acabado.

**Why P1**: Um jogo visualmente inconsistente passa impressão de inacabado, comprometendo a experiência.

**Acceptance Criteria**:

1. WHEN qualquer tela do jogo é exibida THEN SHALL usar a paleta de cores definida:
   - Background: `#1a1a2e` (azul escuro)
   - Células do tabuleiro (vazio): `#16213e`
   - Peças Player 1: `#4361ee` (azul)
   - Peças Player 2: `#e63946` (vermelho)
   - Destaque movimentos curtos: `#4ade80` (verde)
   - Destaque movimentos longos: `#fbbf24` (amarelo)
   - Texto principal: `#e2e8f0`
2. WHEN qualquer tela é exibida THEN SHALL usar a fonte `Inter` (Google Fonts) ou fallback `sans-serif`
3. WHEN botões são exibidos THEN SHALL ter estados visuais: normal, hover e disabled
4. WHEN a tela de login é exibida THEN SHALL ter aparência profissional com logo do jogo e o botão Google seguindo as diretrizes visuais do Google

**Independent Test**: Revisar visualmente todas as telas do jogo e verificar consistência de cores, fonte e espaçamento.

---

### P1: Responsividade básica ⭐ MVP

**User Story**: Como jogador usando desktop ou tablet, quero que o jogo se adapte ao tamanho da minha tela para jogar sem scroll horizontal.

**Why P1**: Sem responsividade mínima, o jogo quebra em telas menores ou diferentes resoluções.

**Acceptance Criteria**:

1. WHEN a janela tem largura ≥ 1024px THEN o tabuleiro SHALL ser exibido em tamanho completo (800x700px)
2. WHEN a janela tem largura entre 600px e 1023px THEN o Canvas SHALL escalar proporcionalmente para caber na tela com margem de 20px
3. WHEN a janela tem largura < 600px THEN a página SHALL exibir aviso "Recomendamos jogar em uma tela maior para melhor experiência" (mas o jogo ainda funciona)
4. WHEN a janela é redimensionada THEN o Canvas SHALL reescalar sem necessidade de recarregar a página

**Independent Test**: Abrir o jogo no browser, redimensionar a janela e verificar que não há scroll horizontal.

---

### P1: Tratamento de erros na interface ⭐ MVP

**User Story**: Como jogador, quero ver mensagens claras quando algo dá errado para entender o que aconteceu e poder agir.

**Why P1**: Sem feedback de erro, o jogador fica perdido quando a aplicação falha.

**Acceptance Criteria**:

1. WHEN qualquer requisição à API falha com erro de rede THEN a interface SHALL exibir um toast/snackbar com "Erro de conexão. Verifique sua internet."
2. WHEN a API retorna `HTTP 500` THEN a interface SHALL exibir "Algo deu errado. Tente novamente em instantes."
3. WHEN a sessão do usuário expira (401) THEN a interface SHALL exibir "Sua sessão expirou. Fazendo login novamente..." e redirecionar para login
4. WHEN mensagens de erro são exibidas THEN SHALL desaparecer automaticamente após 4 segundos

**Independent Test**: Simular erro de rede (desligar backend) e verificar que o toast de erro aparece.

---

### P1: Configuração de produção com Docker ⭐ MVP

**User Story**: Como operador, quero configurar o ambiente de produção via Docker para que o jogo possa ser hospedado em qualquer servidor com Docker instalado.

**Why P1**: Sem configuração de produção, o jogo só existe em localhost.

**Acceptance Criteria**:

1. WHEN `docker compose -f docker-compose.prod.yml up` é executado THEN SHALL subir os serviços em modo produção: FastAPI com workers múltiplos (Gunicorn + Uvicorn), PostgreSQL e Nginx servindo o frontend
2. WHEN o ambiente de produção sobe THEN o backend SHALL rodar com `--workers 2` (mínimo)
3. WHEN o ambiente de produção sobe THEN o Nginx SHALL servir os arquivos estáticos do frontend e fazer proxy reverso para o backend em `/api/`
4. WHEN variáveis `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão configuradas no `.env` de produção THEN o OAuth2 SHALL funcionar com a URL de callback de produção
5. WHEN `docker compose -f docker-compose.prod.yml up` é executado em servidor com IP/domínio público THEN o jogo SHALL ser acessível externamente

**Independent Test**: Executar `docker compose -f docker-compose.prod.yml up` em uma VM/VPS e acessar o IP público no browser.

---

### P2: README de deploy

**User Story**: Como desenvolvedor ou instrutor, quero um guia de deploy documentado para conseguir hospedar o jogo sem conhecimento prévio da infraestrutura.

**Why P2**: Importante para o contexto de aula, mas o deploy pode ser feito sem documentação formal.

**Acceptance Criteria**:

1. WHEN o README é consultado THEN SHALL conter seção "Deploy" com: pré-requisitos, passo a passo para configurar `.env` de produção, comandos para subir em produção e URL de acesso esperada
2. WHEN o README menciona Google OAuth2 THEN SHALL linkar para instruções de como criar credenciais no Google Cloud Console

**Independent Test**: Seguir o README em uma máquina limpa e conseguir fazer deploy sem ajuda externa.

---

### P2: Página 404 customizada

**User Story**: Como jogador, quero ver uma página amigável quando acesso uma URL inexistente para entender que errei o endereço.

**Why P2**: Melhora a experiência, mas não é crítico.

**Acceptance Criteria**:

1. WHEN o usuário acessa uma rota inexistente no frontend THEN SHALL ser exibida uma página com "Página não encontrada" e link para voltar ao início
2. WHEN a API recebe uma rota inexistente THEN SHALL retornar `HTTP 404` com `{"detail": "Not found"}`

**Independent Test**: Acessar `/pagina-inexistente` no browser → verificar página 404 customizada.

---

## Edge Cases

- WHEN as variáveis de ambiente de produção não estão configuradas THEN o backend SHALL falhar com mensagem de erro clara listando quais variáveis estão faltando
- WHEN o banco de dados está indisponível na inicialização de produção THEN o backend SHALL tentar reconectar 3 vezes com backoff exponencial antes de falhar
- WHEN o CORS não está configurado corretamente THEN o frontend SHALL receber erro de CORS e não conseguir acessar a API — o `docker-compose.prod.yml` SHALL configurar a origem permitida via variável de ambiente `ALLOWED_ORIGIN`

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| DEPLOY-01 | Paleta de cores consistente | Tasks | Pending |
| DEPLOY-02 | Fonte Inter aplicada | Tasks | Pending |
| DEPLOY-03 | Estados visuais de botões | Tasks | Pending |
| DEPLOY-04 | Canvas responsivo (≥600px) | Tasks | Pending |
| DEPLOY-05 | Aviso em telas <600px | Tasks | Pending |
| DEPLOY-06 | Toast de erro de rede | Tasks | Pending |
| DEPLOY-07 | Redirecionamento em 401 com mensagem | Tasks | Pending |
| DEPLOY-08 | docker-compose.prod.yml com Nginx + Gunicorn | Tasks | Pending |
| DEPLOY-09 | Proxy reverso Nginx para /api/ | Tasks | Pending |
| DEPLOY-10 | README seção Deploy | Tasks | Pending |
| DEPLOY-11 | Página 404 customizada | Tasks | Pending |

**Coverage:** 11 requisitos, 0 mapeados para tasks, 11 pendentes ⚠️

---

## Success Criteria

- [ ] Todas as telas usam a paleta de cores e fonte definidas
- [ ] Jogo funciona sem scroll horizontal em tela de 768px de largura
- [ ] Erros de rede exibem toast com mensagem amigável
- [ ] `docker compose -f docker-compose.prod.yml up` sobe em servidor externo
- [ ] Jogo acessível via IP/domínio público após deploy
