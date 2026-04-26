# Hexagon — Roadmap

## Milestones

### M1 — Fundação do Projeto
> Ambiente configurado, estrutura base do backend e frontend prontos.

- [ ] Estrutura de pastas do projeto (backend / frontend / infra)
- [ ] Docker Compose com PostgreSQL + FastAPI
- [ ] Configuração do banco de dados e migrações iniciais (Alembic)
- [ ] Servidor FastAPI rodando com health check
- [ ] Página HTML base com Canvas configurado

---

### M2 — Autenticação com Google SSO
> Jogadores podem se cadastrar e fazer login com conta Google.

- [ ] Configurar Google OAuth2 no Google Cloud Console
- [ ] Endpoint de autenticação OAuth2 no FastAPI (`/auth/google`)
- [ ] Geração e validação de JWT de sessão
- [ ] Modelo de usuário no banco (`users`: id, google_id, nome, email, avatar_url)
- [ ] Tela de login no frontend com botão "Entrar com Google"
- [ ] Proteção de rotas autenticadas no frontend

---

### M3 — Motor do Jogo (core game engine)
> Lógica completa do jogo implementada e testada, independente de interface.

- [ ] Representação do tabuleiro hexagonal (raio 4, 61 células)
- [ ] Posicionamento inicial das peças (3 por jogador nos vértices alternados)
- [ ] Algoritmo de células vizinhas (adjacência hex)
- [ ] Regra de movimento curto: duplicação da peça
- [ ] Regra de movimento longo: pulo sem duplicação
- [ ] Regra de conquista: conversão de peças adjacentes do oponente
- [ ] Detecção de fim de jogo (tabuleiro cheio)
- [ ] Contagem e determinação do vencedor
- [ ] Testes unitários das regras

---

### M4 — Interface do Jogo (frontend)
> Jogo visualmente jogável no browser com Canvas.

- [ ] Renderização do tabuleiro hexagonal no Canvas
- [ ] Renderização das peças por jogador (cores distintas)
- [ ] Seleção de peça com clique
- [ ] Highlight das casas válidas para movimento
- [ ] Animação de movimento / duplicação
- [ ] Indicador de turno atual
- [ ] Placar em tempo real (contagem de peças)
- [ ] Tela de fim de jogo com resultado

---

### M5 — Modos de Jogo
> Suporte a Jogador x Computador e Jogador x Jogador.

- [ ] Modo hot-seat: dois jogadores na mesma máquina
- [ ] IA básica para o modo Jogador x Computador (greedy: maximiza conquistas)
- [ ] Seleção de modo de jogo na tela inicial

---

### M6 — Recordes
> Registro e exibição do histórico de partidas e recordes.

- [ ] Modelo de partidas no banco (`games`: id, player1, player2, winner, score, date)
- [ ] Endpoint para salvar resultado de partida
- [ ] Endpoint para listar recordes por jogador
- [ ] Tela de recordes no frontend

---

### M7 — Polimento e Deploy
> Jogo pronto para uso e hospedado.

- [ ] Design visual consistente (CSS)
- [ ] Responsividade básica (desktop e tablet)
- [ ] Tratamento de erros e feedback ao usuário
- [ ] Variáveis de ambiente e configuração de produção
- [ ] Deploy com Docker (servidor ou plataforma cloud)

---

## Feature Backlog (pós-v1)

| Feature | Prioridade | Notas |
|---|---|---|
| Multiplayer online em tempo real | Alta | Requer WebSockets |
| Níveis de dificuldade da IA | Média | Minimax / Alpha-Beta |
| Ranking global | Média | Depende de base de usuários |
| Replay de partidas | Baixa | — |
| App mobile | Baixa | PWA como primeiro passo |
