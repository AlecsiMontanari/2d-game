# Revisão do repositório e próximos passos

## Visão geral atual
O projeto já tem uma base funcional para um **runner 2D em Phaser + TypeScript**, com:

- ciclo de cenas (`BootScene`, `MainMenuScene`, `GameScene`);
- personagem com pulo e tiro;
- sistema simples de pontuação, colisões e game over;
- dificuldade progressiva por aumento de velocidade;
- setup inicial para Android via Capacitor.

Isso é um bom ponto de partida para um **MVP jogável**.

## Pontos fortes
1. **Arquitetura inicial clara por cenas**: facilita evolução incremental.
2. **Fallback com placeholders**: ajuda a manter o jogo executável sem depender de arte final.
3. **Loop de jogo completo**: menu → gameplay → game over/restart.
4. **Pipeline básico web→android**: reduz risco no momento de empacotar demo.

## Principais gaps para publicação de demo em loja

### 1) Qualidade de gameplay (core loop)
Hoje o loop existe, mas ainda está “cru” para retenção mínima de loja:
- pouca variedade de obstáculos/inimigos;
- ausência de meta além de score;
- curva de dificuldade linear e previsível;
- ausência de feedback forte (hit effects, combo, miss, quase-colisão etc.).

### 2) Produto mobile-ready
Faltam itens críticos para release de demo:
- HUD e UI mais robustas (pause, settings, retry mais rápido);
- input touch com botões visuais consistentes em telas diferentes;
- controle de performance (FPS estável em dispositivos médios);
- fluxo de vida mobile (pausar ao minimizar app, retomar corretamente).

### 3) Conteúdo e identidade
- sem camada mínima de direção de arte (paleta, tema, consistência);
- áudio/SFX praticamente ausente;
- falta sensação de progressão (missões curtas, metas por rodada).

### 4) Operação para loja
- falta checklist de publicação (ícones, splash, versão, permissões, política de privacidade);
- sem telemetria básica (sessão, tempo médio, score médio, abandono).

## Roadmap recomendado (6 semanas)

## Semana 1 — Estabilização técnica
**Objetivo:** deixar o projeto previsível para evoluir sem regressões.

- Congelar baseline de build (`npm run build`) e documentar versão de Node.
- Desligar debug de física em produção.
- Padronizar constantes de gameplay (velocidade, spawn, gravidade, cooldown) em arquivo único.
- Criar “GameConfig” central (dificuldade, limites, tuning).
- Adicionar estados explícitos de jogo (menu, running, paused, gameover).

**Entregável:** build limpa + jogo estável em desktop e Android local.

## Semana 2 — Core loop divertido
**Objetivo:** aumentar retenção nos primeiros 3 minutos.

- Introduzir 3 tipos de obstáculo (baixo, alto, móvel).
- Introduzir pelo menos 2 padrões de spawn por dificuldade.
- Criar sistema simples de combo/multiplicador por sequência.
- Melhorar resposta visual do tiro e acerto (partículas simples, flash, shake leve).

**Entregável:** gameplay com variedade perceptível.

## Semana 3 — UX mobile
**Objetivo:** jogabilidade confortável em touchscreen.

- Botões touch visíveis e responsivos (jump/shoot) com feedback.
- Ajuste de layout para diferentes aspect ratios.
- Tela de pausa com retomada e reinício rápido.
- Revisar legibilidade de fontes e contraste.

**Entregável:** versão mobile usável em pelo menos 2 resoluções.

## Semana 4 — Conteúdo mínimo de demo
**Objetivo:** dar “cara de jogo” e não só protótipo.

- Tema visual único (ex.: ruínas/neon/floresta), com assets coerentes.
- Trilha curta em loop + SFX essenciais (pulo, tiro, hit, game over).
- Metas de partida (ex.: sobreviva 60s, elimine 20 inimigos).
- Resultado da rodada com estatísticas (tempo, precisão, recorde).

**Entregável:** demo com identidade e objetivo claro.

## Semana 5 — Preparação de publicação
**Objetivo:** empacotar como produto demo.

- Configurar app id, nome final, ícone, splash e versão.
- Revisar permissões Android (mínimo necessário).
- Criar tela “About/Privacy” com política simples hospedada.
- Definir classificação indicativa e descrição da loja.

**Entregável:** build candidata para teste fechado.

## Semana 6 — Testes e soft launch interno
**Objetivo:** validar qualidade antes da loja.

- Rodar bateria de testes em 3–5 dispositivos Android.
- Medir FPS, travamentos, consumo de bateria e aquecimento.
- Instrumentar eventos simples (start run, game over, duração).
- Corrigir top 10 problemas encontrados.

**Entregável:** APK/AAB de demo pronta para publicação inicial.

## Backlog técnico priorizado

### Prioridade alta (fazer agora)
1. Arquivo de constantes/config de gameplay.
2. Botões touch de HUD (não apenas texto instrucional).
3. Pausa/resume robusto.
4. Sistema de áudio (SFX básico).
5. Ajustes de performance e remoção de debug visual.

### Prioridade média
1. Persistência de high score local.
2. Tela de resultados mais rica.
3. Balanceamento fino da dificuldade.
4. Pequeno sistema de missões diárias/objetivos por run.

### Prioridade baixa
1. Localização (PT/EN).
2. Efeitos visuais avançados.
3. Monetização (somente depois de validar retenção da demo).

## Métricas simples para decidir evolução
Mesmo sendo demo, acompanhe:

- **D1 interno (tester retorna no dia seguinte)**;
- **Tempo médio por sessão**;
- **Runs por sessão**;
- **Taxa de falha precoce** (morte < 15s);
- **Distribuição de score**.

Se esses indicadores melhorarem a cada sprint, o projeto está no caminho certo para escalar.

## Próximo passo prático (imediato)
Começar pela **Semana 1**, abrindo 4 tarefas:

1. `gameConfig.ts` com todos os parâmetros atuais hardcoded.
2. flag de ambiente para `physics.arcade.debug`.
3. estado de jogo com `paused` real.
4. checklist de release Android no README.

Com isso, a base fica sólida para acelerar conteúdo e publicação.
