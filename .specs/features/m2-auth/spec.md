# M2 — Autenticação com Google SSO

## Problem Statement

Para registrar recordes e identificar jogadores, o sistema precisa saber quem está jogando. Criar um sistema de cadastro manual (email + senha) seria custoso e desnecessário dado que o Google SSO oferece autenticação segura, sem fricção e amplamente conhecida pelos usuários. O objetivo é permitir que qualquer pessoa entre no jogo com um clique, usando sua conta Google.

## Goals

- [ ] Jogadores podem entrar no jogo usando apenas sua conta Google (zero cadastro manual)
- [ ] Sessão gerenciada via JWT, válida por 7 dias
- [ ] Perfil do jogador criado automaticamente na primeira entrada

## Out of Scope

| Feature | Reason |
|---|---|
| Cadastro manual com email/senha | Deliberadamente excluído — apenas Google SSO na v1 |
| Recuperação de senha | Sem cadastro manual, não se aplica |
| Outros provedores OAuth (GitHub, Facebook) | Pós-v1 |
| Autenticação de dois fatores | Pós-v1 |
| Administração de usuários (painel admin) | Pós-v1 |

---

## User Stories

### P1: Login com Google ⭐ MVP

**User Story**: Como visitante, quero entrar no jogo clicando em "Entrar com Google" para não precisar criar uma conta separada.

**Why P1**: Sem autenticação, não há como identificar jogadores nem registrar recordes.

**Acceptance Criteria**:

1. WHEN o usuário acessa a página inicial sem sessão ativa THEN o sistema SHALL exibir a tela de login com o botão "Entrar com Google"
2. WHEN o usuário clica em "Entrar com Google" THEN o sistema SHALL redirecionar para a tela de consentimento do Google OAuth2
3. WHEN o usuário autoriza o acesso no Google THEN o sistema SHALL criar ou recuperar o perfil do jogador e emitir um JWT de sessão
4. WHEN o JWT é emitido THEN o sistema SHALL redirecionar o usuário para a tela principal do jogo
5. WHEN o Google retorna erro ou o usuário cancela THEN o sistema SHALL exibir mensagem "Login cancelado. Tente novamente." e retornar à tela de login

**Independent Test**: Abrir a aplicação em aba anônima → clicar em "Entrar com Google" → autenticar → verificar que a tela principal do jogo é exibida.

---

### P1: Criação automática de perfil ⭐ MVP

**User Story**: Como novo jogador, quero que meu perfil seja criado automaticamente no primeiro login para não precisar preencher nenhum formulário.

**Why P1**: Sem perfil, não há como associar recordes ao jogador.

**Acceptance Criteria**:

1. WHEN um usuário faz login pela primeira vez THEN o sistema SHALL criar um registro na tabela `users` com `google_id`, `nome`, `email` e `avatar_url` vindos do Google
2. WHEN um usuário que já possui cadastro faz login novamente THEN o sistema SHALL reutilizar o perfil existente sem criar duplicata
3. WHEN o Google retorna um `google_id` diferente para o mesmo email THEN o sistema SHALL tratar como usuário distinto

**Independent Test**: Verificar no banco que após o primeiro login um registro na tabela `users` é criado com os dados do Google.

---

### P1: Proteção de rotas autenticadas ⭐ MVP

**User Story**: Como sistema, quero garantir que apenas jogadores autenticados acessem o jogo e os recordes para proteger os dados dos usuários.

**Why P1**: Sem proteção de rotas, qualquer pessoa poderia manipular recordes ou acessar dados de outros jogadores.

**Acceptance Criteria**:

1. WHEN uma requisição chega a qualquer endpoint protegido sem JWT válido THEN a API SHALL retornar `HTTP 401 Unauthorized`
2. WHEN um JWT expirado é enviado THEN a API SHALL retornar `HTTP 401` com mensagem `{"detail": "Token expirado"}`
3. WHEN o frontend detecta `HTTP 401` THEN SHALL redirecionar o usuário para a tela de login
4. WHEN o usuário tenta acessar uma URL protegida sem sessão THEN o frontend SHALL redirecionar para login antes de exibir a página

**Independent Test**: Fazer uma requisição `curl` para `/api/games` sem token → esperar `HTTP 401`.

---

### P2: Exibição do perfil do jogador na interface

**User Story**: Como jogador autenticado, quero ver meu nome e foto na interface para confirmar que estou logado com a conta correta.

**Why P2**: Importante para UX, mas não bloqueia o funcionamento do jogo.

**Acceptance Criteria**:

1. WHEN o jogador está autenticado THEN a interface SHALL exibir o avatar e o nome do jogador no canto superior da tela
2. WHEN o avatar do Google não está disponível THEN o sistema SHALL exibir um avatar genérico com as iniciais do jogador

**Independent Test**: Fazer login e verificar visualmente que nome e foto aparecem na interface.

---

### P2: Logout

**User Story**: Como jogador, quero poder sair da minha conta para que outra pessoa possa jogar no mesmo dispositivo.

**Why P2**: Necessário para o modo hot-seat (dois jogadores, mesma máquina), mas não bloqueia o MVP.

**Acceptance Criteria**:

1. WHEN o jogador clica em "Sair" THEN o sistema SHALL invalidar o JWT no cliente (remover do storage) e redirecionar para a tela de login
2. WHEN o jogador faz logout THEN qualquer requisição subsequente com o token antigo SHALL retornar `HTTP 401`

**Independent Test**: Fazer login → clicar em "Sair" → verificar redirecionamento para login e que o token foi removido do localStorage.

---

## Edge Cases

- WHEN o servidor do Google está indisponível THEN o sistema SHALL exibir "Serviço de login temporariamente indisponível. Tente em instantes."
- WHEN o JWT contém um `google_id` que não existe mais no banco THEN o sistema SHALL retornar `HTTP 401` e forçar novo login
- WHEN dois logins simultâneos ocorrem com a mesma conta Google THEN o sistema SHALL criar apenas um registro de usuário (idempotência por `google_id`)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| AUTH-01 | Tela de login com botão Google | Tasks | Verified |
| AUTH-02 | Redirecionamento OAuth2 | Tasks | Verified |
| AUTH-03 | Callback e emissão de JWT | Tasks | Verified |
| AUTH-04 | Criação automática de perfil (primeira entrada) | Tasks | Verified |
| AUTH-05 | Reutilização de perfil existente | Tasks | Verified |
| AUTH-06 | Proteção de endpoints via JWT | Tasks | Verified |
| AUTH-07 | Redirecionamento frontend em 401 | Tasks | Verified |
| AUTH-08 | Exibição de avatar e nome na interface | Tasks | Verified |
| AUTH-09 | Logout e remoção de token | Tasks | Verified |

**Coverage:** 9 requisitos, 0 mapeados para tasks, 9 pendentes ⚠️

---

## Success Criteria

- [ ] Login com conta Google funciona de ponta a ponta em menos de 5 segundos
- [ ] Perfil criado automaticamente no banco após primeiro login
- [ ] Rotas protegidas retornam 401 sem JWT válido
- [ ] Logout remove sessão e redireciona para login
