# 🎴 Truco Venezolano — Plataforma de Cartas

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Plataforma digital de juegos de cartas venezolanos y clásicos hispanos. Desarrollada con React + TypeScript, con diseño visual estilo Balatro, IA por oponente, sistema de torneos, avatares con estados de ánimo y soporte completo para escritorio y móvil.

---

## 🃏 Juegos Disponibles

| Juego | Cartas | Descripción |
|-------|--------|-------------|
| 🎮 **Truco Venezolano** | Española 40 | Juego de cartas 1v1 con Envido, Truco, Flor y sistema de torneo |
| 🃏 **Siete y Medio** | Española 40 | Acércate a 7½ sin pasarte — figuras valen ½ punto |
| 🎴 **Brisca** | Española 40 | Gana puntos capturando cartas de valor en rondas de truco |
| 🃏 **Chinchón** | Española 40 | Forma escaleras o grupos y cierra con la menor puntuación |
| 🂡 **Veintiuno** | Española 40 | Blackjack clásico: llega a 21, blackjack paga 3:2 |

Todos los juegos comparten:
- Selección de baraja (4 estilos) y mesa (4 tableros)
- 7 oponentes IA con personalidad propia y moods reactivos
- Avatares animados según resultado (feliz / triste / engreído / neutro)
- Interfaz consistente con header, badges de juego y áreas de cartas

---

## 🆕 Historial de versiones

### Mayo 2026
- **Mobile UX overhaul** en los 4 mini-juegos (SyM, Brisca, Chinchón, Veintiuno):
  - Setup screen con tabs separados (Baraja / Mesa / Oponente) — imágenes grandes por panel
  - Párrafo de descripción del juego en cada pantalla de configuración
  - Header en dos filas en móvil — badge arriba, stats abajo (sin solapamiento)
  - Cartas ~2x más grandes en móvil: 80×112px (≤768px) / 68×95px (≤480px)
  - Chinchón mano completa (7 cartas) con scroll horizontal en móvil
  - Controles de apuesta compactos en móvil
  - Avatares y columnas de grid ajustados para no cubrir el área de juego
  - Estado de mesa limpiado al iniciar nueva ronda en todos los juegos
- **Veintiuno (Blackjack)** implementado: As suave/duro, blackjack 3:2, doblar apuesta, dealer para en 17+, flash de blackjack animado, tema naranja distintivo
- Avatares con moods reactivos en los 4 mini-juegos
- UI consistente entre todos los juegos: header 64px, badge de nombre, áreas de juego con fondo de tablero, tarjetas visibles sobre cualquier fondo
- Botón Volver sin solapar contenido en ningún juego

### Oct 2025
- Scroll del tutorial corregido
- IA usa la personalidad específica del oponente elegido
- Canvas fijo 1280×720 (16:9), video de fondo 1280×720@30fps
- Plan multi-juego documentado

---

## 🎯 Truco Venezolano — Reglas

### Baraja
- **Española de 40 cartas** (sin 8s y 9s)
- **Palos**: Espadas ♠, Bastos ♣, Oros ♦, Copas ♥
- **Valores**: As, 2, 3, 4, 5, 6, 7, Sota(10), Caballo(11), Rey(12)

### Jerarquía de cartas (mayor → menor)
1. As de Espadas (14) — la más poderosa
2. As de Bastos (13)
3. 7 de Espadas (12)
4. 7 de Oros (11)
5. 3 de cualquier palo (10)
6. 2 de cualquier palo (9)
7. As (restantes palos) (8)
8. Rey (7), Caballo (6), Sota (5)
9. 7 restantes (4), 6 (3), 5 (2), 4 (1)

### Mecánica
- **Jugadores**: 2 (humano vs IA)
- **Cartas por mano**: 3
- **Objetivo**: llegar a 30 puntos

### Envido
| Tipo | Puntos |
|------|--------|
| Envido | 2 |
| Real Envido | 3 |
| Falta Envido | Puntos restantes para llegar a 30 |

### Truco
| Nivel | Puntos |
|-------|--------|
| Truco | 2 |
| Retruco | 3 |
| Vale Nueve | 9 |

### Flor
3 cartas del mismo palo → 3 puntos automáticos, cantado antes de jugar.

---

## 🂡 Veintiuno — Reglas

- **Objetivo**: llegar a 21 sin pasarse
- **As**: vale 1 u 11 (automático, "suave ♦" cuando cuenta como 11)
- **Figuras** (Sota, Caballo, Rey): valen 10
- **Números** 2–7: valor nominal
- **Blackjack** (21 con 2 cartas): paga 3:2
- **Dealer**: para en 17+ duro; pide con 17 suave
- **Doblar**: dobla apuesta, recibe exactamente una carta más

---

## 🏗️ Arquitectura

```
src/
├── components/
│   ├── MainScreen.tsx          # Menú principal con todos los juegos
│   ├── GameBoard.tsx           # Tablero Truco Venezolano
│   ├── SieteMedioScreen.tsx    # Juego 7½
│   ├── BriscaScreen.tsx        # Juego Brisca
│   ├── ChinchonScreen.tsx      # Juego Chinchón
│   ├── VeintiunoScreen.tsx     # Juego 21/Blackjack
│   ├── SetupScreen.tsx
│   ├── TournamentsScreen.tsx
│   ├── TutorialScreen.tsx
│   └── ...otros
├── utils/
│   ├── gameLogic.ts            # Motor Truco Venezolano
│   ├── sieteMedioLogic.ts      # Motor Siete y Medio
│   ├── briscaLogic.ts          # Motor Brisca
│   ├── chinchonLogic.ts        # Motor Chinchón
│   ├── veintiunoLogic.ts       # Motor Veintiuno (Blackjack)
│   ├── ai.ts                   # IA con personalidad por oponente
│   ├── avatarMoods.ts          # Sistema de moods de avatares
│   └── cards.ts                # Baraja española 40 cartas
├── types/index.ts              # Todos los tipos TypeScript
├── styles/
│   ├── App.css
│   └── components.css          # Estilos completos de todos los juegos
└── data/aiCharacters.ts        # 7 oponentes IA
```

### Navegación
`App.tsx` controla toda la navegación por string (`navigateTo(screen)`). Screens con canvas propio (mini-juegos y game-board) se renderizan dentro de `.game-canvas`.

### IA y personalidad
Cada oponente tiene `agresividad`, `riesgo`, `blufeo`, `consistencia` — usados por `ai.ts` para modular decisiones. Los avatares reaccionan a resultados con moods (`happy`, `sad`, `smug`, `default`) que se resetean a los 5 segundos.

### Config runtime
- `public/config/ai_characters.json` — mapa de oponentes IA (usado por torneos)
- `public/config/tournament_configuration.json` — definición de torneos

---

## 🚀 Instalación

### Prerrequisitos
- Node.js 16+
- npm

```bash
git clone https://github.com/Miltondz/truco-venezolano-react-ts.git
cd truco-venezolano-react-ts
npm install
npm start          # dev en puerto 3000
npm run build      # producción (CI=false npm run build)
```

### Scripts
| Comando | Acción |
|---------|--------|
| `npm start` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm test` | Tests en modo watch |

---

## 📐 Canvas y video

- Canvas del tablero: **1280×720** (16:9). Layout responsive, zona jugable mantiene relación de aspecto.
- Mini-juegos: `position: fixed; width: min(1280px, 100vw)` — sin scroll, sin overflow lateral.
- Video de fondo recomendado: 1280×720 @ 30fps, H.264, ~5–6 MB, sin audio.

---

## 🤝 Contribuir

- Abre un issue para propuestas o bugs.
- Para juegos nuevos: crear `src/utils/<juego>Logic.ts` + `src/components/<Juego>Screen.tsx`, reusar clases `.sm-*` como base.
- Pull requests bienvenidos: commit claro con scope.

## 📄 Licencia

MIT — ver `LICENSE`.

## 🙏 Créditos

- Truco Venezolano tradicional
- Estilo visual inspirado en **Balatro** de LocalThunk
- Comunidad React + TypeScript

---

**¡Cuatro juegos, una sola plataforma, pura cultura venezolana!** 🎴🂡
