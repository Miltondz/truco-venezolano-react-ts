# 📱 Rediseño del Layout Móvil - Distribución Simétrica

## 🎯 Objetivo
Crear una distribución simétrica y equilibrada del tablero de juego para dispositivos móviles, con secciones claramente definidas para jugador y oponente en posiciones opuestas.

## 📐 Nueva Estructura (Vertical)

```
┌─────────────────────────────────────┐
│   HEADER (60px)                     │
│   [⏸️ Pausa] [Status] [Scores]     │
├─────────────────────────────────────┤
│                                     │
│   COMPUTER SECTION (140-160px)     │
│   ┌───────────────────────────┐   │
│   │ 🤖 Avatar    ┌─┬─┬─┐      │   │
│   │ (left)       │▯│▯│▯│      │   │
│   │              └─┴─┴─┘      │   │
│   │        Computer Hand      │   │
│   │     [Personality Info]    │   │
│   └───────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│   PLAY AREA (200-280px)            │
│   ┌───────────────────────────┐   │
│   │                           │   │
│   │    ┌──┐      ┌──┐        │   │
│   │    │🃏│  VS  │🃏│        │   │
│   │    └──┘      └──┘        │   │
│   │   Computer  Player       │   │
│   │                           │   │
│   └───────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│   PLAYER SECTION (180-240px)       │
│   ┌───────────────────────────┐   │
│   │        Player Hand        │   │
│   │      ┌─┬─┬─┐              │   │
│   │      │▯│▯│▯│   👤 Avatar  │   │
│   │      └─┴─┴─┘   (right)    │   │
│   │                           │   │
│   └───────────────────────────┘   │
│   [🎵 Envido] [🎺 Truco] [Otros] │
│                                     │
├─────────────────────────────────────┤
│   LORE PANEL (colapsable)          │
│   [Info de jugadas] [🔽]           │
└─────────────────────────────────────┘
```

## ✨ Características Principales

### 1. **Simetría Perfecta**
- **Computer Section (TOP)**: Avatar a la izquierda, cartas centradas
- **Player Section (BOTTOM)**: Avatar a la derecha, cartas centradas
- Ambas secciones con gradientes de fondo opuestos
- Tamaños de avatar idénticos (75px × 75px)
- Espaciado y padding simétricos

### 2. **Área de Juego Central**
- Zona de batalla claramente definida
- Cartas jugadas más grandes (80px × 112px) para mejor visibilidad
- Indicador "VS" circular y destacado
- Gradiente radial dorado para dar énfasis
- Bordes superior e inferior para delimitar el área

### 3. **Tamaños Optimizados**

#### Avatares:
- **Tamaño**: 75px × 75px
- **Borde**: 3px dorado
- **Sombra**: Resplandor dorado (0 0 15px)
- **Posición**: Absoluta en los costados

#### Cartas:
- **Mano (computer/player)**: 55px × 77px
- **Cartas jugadas**: 80px × 112px
- **Gap entre cartas**: 0.5rem

#### Botones de Acción:
- **Min height**: 44px (touch-friendly)
- **Font size**: 0.65rem
- **Width**: 70-110px (flexible)
- **Layout**: Row wrap con gap 0.3rem

### 4. **Header Compacto**
```
┌──────────────────────────────────┐
│ [⏸️]  [Tu turno]  [👤:0 🤖:0]  │
│        [Ronda 1/3]              │
└──────────────────────────────────┘
```
- Max height: 60px
- Flex row con espacio entre elementos
- Información centrada y condensada

### 5. **Sections con Gradientes**
```css
Computer: linear-gradient(180deg, black 40%, transparent)
Player:   linear-gradient(0deg, black 40%, transparent)
```

### 6. **Lore Panel Móvil**
- Posición: Fixed en la parte inferior
- Altura: Auto (max 120px)
- Colapsable a 35px
- Z-index: 100 (no interfiere con controles)
- Font size reducido: 0.6-0.7rem

## 🎮 Distribución de Controles

### Computer Section (TOP):
- ✅ Avatar: Lado izquierdo (absolute)
- ✅ Cartas: Centradas con padding lateral
- ✅ Personality indicator: Abajo al centro
- ✅ AI thinking: Arriba a la derecha

### Play Area (CENTRO):
- ✅ Cartas jugadas lado a lado
- ✅ Indicador VS circular
- ✅ Labels encima de cada carta
- ✅ Fondo con gradiente radial

### Player Section (BOTTOM):
- ✅ Avatar: Lado derecho (absolute)
- ✅ Cartas: Centradas con padding lateral
- ✅ Botones de acción: Abajo en row wrap

## 📏 Alturas de Secciones

| Sección | Min Height | Max Height |
|---------|-----------|-----------|
| Header | 60px | 60px |
| Computer | 140px | 160px |
| Play Area | 200px | 280px |
| Player | 180px | 240px |
| Lore Panel | 35px | 120px |

## 🎨 Mejoras Visuales

1. **Bordes y Sombras**:
   - Avatares con borde dorado brillante
   - VS indicator con sombra dorada
   - Gradientes suaves en secciones

2. **Espaciado Consistente**:
   - Gap: 0.25-0.5rem entre elementos
   - Padding: 0.5rem en secciones principales
   - Padding lateral: 80px en hands (espacio para avatares)

3. **Touch Targets**:
   - Todos los botones: min 44px de altura
   - Cartas: tamaño adecuado para tocar
   - Spacing suficiente entre elementos clickeables

## 🔧 Breakpoints

- **Desktop**: min-width: 769px (layout absoluto original)
- **Tablet/Mobile**: max-width: 768px (nuevo layout simétrico)
- **Small Mobile**: max-width: 480px (ajustes menores)

## ✅ Checklist de Implementación

- [x] Desactivar scaling en móvil
- [x] Layout flexbox vertical (height: 100vh)
- [x] Secciones simétricas (computer/player)
- [x] Avatares en posiciones opuestas
- [x] Play area central destacada
- [x] Tamaños de carta optimizados
- [x] Botones touch-friendly
- [x] Lore panel reposicionado
- [x] Gradientes de fondo
- [x] Indicadores de personalidad
- [x] Headers y footers compactos

## 🚀 Resultado Final

El nuevo layout móvil proporciona:
- ✨ **Simetría visual** perfecta
- 👀 **Mayor visibilidad** de elementos importantes
- 👆 **Mejor usabilidad** táctil
- 🎯 **Jerarquía clara** de información
- 🎨 **Estética mejorada** con gradientes y sombras
- 📱 **Optimización completa** para pantallas móviles

---

**Última actualización**: 2025-01-10
**Autor**: AI Agent Mode
**Versión**: 2.0 - Distribución Simétrica
