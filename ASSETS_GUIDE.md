# 📋 Guia de Assets - Configuração Completa

## 🎯 Estrutura de Pastas

```
src/assets/
├── player-idle.png      ✅ Configurado (4 frames)
├── player-jump.png      ✅ Configurado (2 frames)
├── player-attack.png    ✅ Configurado (3 frames)
├── player-run.png       ✅ Configurado (6 frames em grid 2x3)
├── enemy.png            ✅ Configurado (6 frames em grid 2x3)
├── platform.png         (Opcional)
├── obstacle.png         (Opcional)
└── star.png             (Opcional)
```

---

## 🎨 Especificações dos Spritesheets

### **Personagem (Player)**

#### 1. player-idle.png (Idle/Parado)
- **Frames**: 4
- **Formato**: Horizontal (1 linha)
- **Dimensões por frame**: 32x48px
- **Velocidade**: 8 FPS | **Loop**: Sim

#### 2. player-jump.png (Pulando)
- **Frames**: 2
- **Formato**: Horizontal (1 linha)
- **Dimensões por frame**: 32x48px
- **Velocidade**: 10 FPS | **Loop**: Não

#### 3. player-attack.png (Atirando)
- **Frames**: 3
- **Formato**: Horizontal (1 linha)
- **Dimensões por frame**: 32x48px
- **Velocidade**: 12 FPS | **Loop**: Não

#### 4. player-run.png (Correndo)
- **Frames**: 6
- **Formato**: Grid 2x3 (3 colunas, 2 linhas)
- **Dimensões por frame**: 32x48px
- **Velocidade**: 10 FPS | **Loop**: Sim

---

### **Inimigo (Enemy)**

#### 5. enemy.png (Movimento) ✨ NOVO
- **Frames**: 6
- **Formato**: Grid 2x3 (3 colunas, 2 linhas)
- **Dimensões por frame**: 32x32px
- **Velocidade**: 8 FPS | **Loop**: Sim

```
Grid Layout (3 colunas × 2 linhas):
[Frame 0][Frame 1][Frame 2]
[Frame 3][Frame 4][Frame 5]
```

**Animação**: `enemy_move` (toca automaticamente quando o inimigo aparece)

---

## ⚙️ Como Ajustar Dimensões do Inimigo

Se sua imagem de inimigo tiver dimensões diferentes de 32x32px por frame:

### Edite `BootScene.ts` (linhas 27-31):

```typescript
this.load.spritesheet('enemy', 'src/assets/enemy.png', { 
    frameWidth: 32,   // ⚠️ Largura de cada frame
    frameHeight: 32   // ⚠️ Altura de cada frame
});
```

### Exemplo: Inimigo com frames de 64x64px

```typescript
frameWidth: 64,    // frames maiores
frameHeight: 64
```

---

## 🎬 Sistema de Animações - Completo

### **Jogador**

| Estado | Animação | Loop | Prioridade |
|--------|----------|------|-----------|
| No chão | `run` | ✅ Sim | Normal |
| No ar | `jump` | ❌ Não | Alta |
| Atirando | `attack` | ❌ Não | Máxima |
| Parado (fallback) | `idle` | ✅ Sim | Baixa |

### **Inimigo** ✨ NOVO

| Estado | Animação | Loop |
|--------|----------|------|
| Sempre | `enemy_move` | ✅ Sim |

**Comportamento**: 
- Inimigos tocam a animação `enemy_move` automaticamente ao serem criados
- A animação continua em loop até o inimigo ser destruído

---

## 📝 Checklist de Integração

### Personagem
- [x] BootScene carrega `player_idle`, `player_jump`, `player_attack`, `player_run`
- [x] Animações criadas e funcionando
- [x] Troca automática baseada no estado do jogador
- [x] Fallback para placeholders

### Inimigo ✨
- [x] BootScene carrega `enemy`
- [x] Animação `enemy_move` criada
- [x] Inimigos tocam animação automaticamente ao spawnar
- [x] Fallback para placeholder se asset não existir

### Para Você Fazer
- [ ] Adicionar `enemy.png` em `src/assets/`
- [ ] Ajustar `frameWidth`/`frameHeight` se necessário (linha 29-30 do BootScene)
- [ ] Testar e verificar se a animação está suave

---

## 🚀 Como Testar

1. Coloque `enemy.png` em `src/assets/`
2. Execute: `npm run dev`
3. No jogo:
   - Veja os inimigos roxos aparecer da direita
   - ✅ A animação deve tocar automaticamente
   - ✅ Devem se mover da direita para esquerda

**Console (F12)**:
- ✅ Sem erros "Asset not found"
- ✅ Sem avisos sobre texturas

---

## 📐 Layout do Grid 2x3

### Entendendo o Grid

```
Arquivo: enemy.png (96x64px com frames de 32x32px)

┌─────────┬─────────┬─────────┐
│ Frame 0 │ Frame 1 │ Frame 2 │  ← Linha 1
├─────────┼─────────┼─────────┤
│ Frame 3 │ Frame 4 │ Frame 5 │  ← Linha 2
└─────────┴─────────┴─────────┘
   Col 1     Col 2     Col 3
```

**Phaser lê**: Esquerda→Direita, Cima→Baixo (0→5)

---

## 🔧 Solução de Problemas

### "Inimigo aparece estático/sem animação"
✅ Verifique se `enemy.png` está em `src/assets/`
✅ Confira dimensões: `frameWidth` e `frameHeight` corretos?
✅ Console mostra erro? Verifique o caminho do arquivo

### "Animação muito rápida/lenta"
Ajuste `frameRate` no `BootScene.ts` linha 128:
```typescript
frameRate: 8,  // menor = mais lento, maior = mais rápido
```

### "Frames cortados ou sobrepostos"
Suas dimensões de frame estão incorretas. Calcule:
- **frameWidth** = Largura total da imagem ÷ 3 (colunas)
- **frameHeight** = Altura total da imagem ÷ 2 (linhas)
