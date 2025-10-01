# Plan de expansión multi-juego: Arquitectura técnica y estrategia comercial

Fecha: 2025-10-01
Autor: Equipo Truco React TS

---

## 1) Resumen Ejecutivo

Objetivo: habilitar múltiples juegos de cartas (baraja española 40 y francesa 52) dentro del mismo proyecto, maximizando reutilización de código (UI/IA/estados) y minimizando impacto en la interfaz. Además, definir la estrategia comercial: ¿un "hub" de juegos en una sola app o apps separadas por juego?

Recomendación:
- Técnica: extraer un Engine genérico por juego + estado base, y sumar motores modulares (Brisca, Escoba 15, Crazy Eights, Blackjack, Gin Rummy/Chinchón) de menor a mayor complejidad.
- Comercial: empezar con un HUB (una sola app con varios juegos) para aprovechar retención, cross-promo y menor CPI. Si un juego specifico supera KPIs de adquisición/retención, lanzar su versión stand-alone optimizada para ASO (fase 2).

Roadmap sugerido (alto impacto/menor coste):
1. Brisca (1–2 semanas)
2. Escoba de 15 (1–2 semanas)
3. Crazy Eights (Ocho Loco) (1–2 semanas)
4. Blackjack (3–7 días)
5. Gin Rummy/Chinchón (2–3 semanas)

---

## 2) Estado actual del sistema (snapshot)

- UI
  - Canvas: 1280×720 (16:9) con responsive avanzado.
  - Componentes reutilizables: cartas, mano del jugador, controles base, audio, navegación.
- Lógica
  - Truco (Venezolano): rondas best-of-3, cantos, envido/flor, IA con personalidad.
- Datos/IA
  - Oponentes con rasgos (agresividad/risgo/blufeo/consistencia) y dificultad.
  - Personalidad de IA corregida para usar la del oponente seleccionado (no aleatoria).
- Tutorial y Logros
  - Lecciones/tips, progreso, achievements.

Riesgos actuales mitigados: doble scrollbar; scroll único en step-content-scrollable; personalidad IA vinculada al oponente.

---

## 3) Arquitectura propuesta multi-juego

### 3.1 Interfaz de Engine común

```ts path=null start=null
// Engine genérico por juego
export interface GameEngine<GState extends BaseGameState, Move> {
  id: 'truco' | 'brisca' | 'escoba' | 'blackjack' | 'crazy8' | 'gin' | string;
  init(config: EngineConfig): GState;
  startNewHand(s: GState): GState;
  getValidMoves(s: GState): Move[];        // La UI genera botones/acciones a partir de aquí
  applyMove(s: GState, m: Move): GState;   // Estado inmutable
  isHandOver(s: GState): boolean;
  isGameOver(s: GState): boolean;
  score(s: GState): { player: number; opponent: number };
  aiSelectMove(s: GState): Move;           // IA por juego, reusando personalidad
  getUiHints?(s: GState): Partial<{
    highlightPlayable: number[];
    requiresMultiSelect: boolean;  // Escoba 15
    requiresSuitPick: boolean;     // Crazy Eights
    trumpSuit?: string;            // Brisca
    showDealer?: boolean;          // Blackjack
  }>;
}

export interface EngineConfig {
  difficulty: 'easy'|'medium'|'intermediate'|'hard'|'master';
  selectedOpponent?: AICharacter | null;   // Dealer/IA
  deckType: 'spanish-40'|'french-52';
}

export interface BaseGameState {
  gameId: string;
  turn: 'player'|'opponent';
  playerHand: Card[];
  opponentHand?: Card[];         // Opcional (ocultas según juego)
  table?: Card[];                // Mesa/pozo si aplica
  discard?: Card[];
  deck: Card[];
  scores: { player: number; opponent: number };
  phase?: string;
  difficulty: 'easy'|'medium'|'intermediate'|'hard'|'master';
  selectedOpponent: AICharacter | null;
  aiPersonality: AIPersonality;
}
```

### 3.2 Estructura de carpetas propuesta

```text path=null start=null
src/
  gameEngines/
    truco/
      trucoEngine.ts
      trucoRules.ts
      trucoAI.ts
    brisca/
      briscaEngine.ts
      briscaRules.ts
      briscaAI.ts
    escoba/
      escobaEngine.ts
      escobaRules.ts
      escobaAI.ts
    crazy8/
      crazy8Engine.ts
      crazy8Rules.ts
      crazy8AI.ts
    blackjack/
      blackjackEngine.ts
      blackjackRules.ts
      blackjackAI.ts
    gin/
      ginEngine.ts
      ginRules.ts
      ginAI.ts
  shared/
    cards.ts        // baraja 40/52, utilidades de mazo
    deck.ts
    aiPersonality.ts
    scoring.ts
  components/
    GameBoardHost.tsx  // Orquesta la UI en base a getValidMoves() y getUiHints()
    boards/
      TrucoBoard.tsx
      BriscaBoard.tsx
      EscobaBoard.tsx
      Crazy8Board.tsx
      BlackjackBoard.tsx
      GinBoard.tsx
```

### 3.3 Reutilización por juego (matriz resumida)

- Mano del jugador/cartas/animaciones: 80–100% reutilizable.
- Turnos/estados base: 70–90%.
- IA y personalidad: 60–80% (función aiSelectMove por juego).
- Tablero (Board): 30–80% según juego; controles cambian más.

### 3.4 Impacto UI por juego (estimación)

- Brisca: bajo (20–30%). Indicador de triunfo, puntos por baza.
- Escoba 15: medio (35–45%). Mesa con selección múltiple y confirmación.
- Crazy Eights: medio (40–50%). Pozo/robo, selector de palo al jugar 8.
- Blackjack: medio (50–60%). Layout dealer/jugador, botones Hit/Stand/Doble/Split.
- Gin/Chinchón: medio-alto (50–65%). Pila de descarte, detección de sets/runs, botón “cerrar/knock”.

---

## 4) Juegos objetivo por mercado (Venezuela y Chile) con baraja 40/52

### 4.1 Prioridad técnica + popularidad

1. Brisca (40) – 1–2 semanas – muy compatible, reglas simples.
2. Escoba de 15 (40 ó 52→40) – 1–2 semanas – altísimo atractivo en Chile.
3. Crazy Eights (52) – 1–2 semanas – “UNO con baraja”; onboarding instantáneo.
4. Blackjack (52) – 3–7 días – alto engagement móvil, sin IA compleja multi-oponente.
5. Gin Rummy/Chinchón (52/40) – 2–3 semanas – profundidad y retención.

(Opcionales avanzados: Carioca Lite, Texas Hold’em)

---

## 5) Estimaciones de implementación

- Brisca: 40–60 h (motor + UI + IA básica + pruebas).
- Escoba: 40–60 h.
- Crazy Eights: 40–60 h.
- Blackjack: 24–40 h.
- Gin/Chinchón: 60–100 h.

Incluye: QA en desktop/móvil, animaciones mínimas, tutorial breve por juego, logros.

---

## 6) IA y personalidad

- Reutilizar AIPersonality actual (agresividad/intimidación/cálculo/adaptabilidad).
- Mapear efectos por juego (p.ej., en Escoba: cálculo→explorar combinaciones; agresividad→preferir capturas altas; en Brisca: agresividad→gastar triunfo temprano; cálculo→guardar carta mínima ganadora).
- Mantener perfiles por dificultad; logging de decisiones para ajuste fino.

---

## 7) Persistencia, tutoriales y logros

- Namespacing por juego: `progress.{gameId}.*`, `achievements.{gameId}.*`.
- Tutorial corto por juego: 3–5 pasos, con tips y un reto inicial.
- Logros transversales (sesiones, rachas) + específicos (escobas perfectas, bazas de triunfo, etc.).

---

## 8) Performance y assets

- Canvas 1280×720 (16:9); video de fondo recomendado 1280×720 @30fps (5–6 MB) con imagen fallback.
- Baraja 52 añadida junto a 40 (normalizar assets y nomenclatura de palos/valores).
- Reducir layout shift; animaciones con requestAnimationFrame y transform.

---

## 9) Estrategia comercial: ¿Hub único o apps separadas?

### 9.1 Hub único (multi-juego en la misma app)

Pros:
- CPI menor: una sola adquisición alimenta varios juegos (cross-sell in-app).
- Retención: más variedad → mayor tiempo de sesión/retorno.
- Mantenimiento: un solo pipeline de release, assets compartidos.
- Monetización: pase de desafíos semanal multi-juego; IAP “remove ads” global; skins de cartas/tableros.

Contras:
- ASO menos focalizado: difícil rankear por keywords de un juego concreto.
- Tamaño de app mayor si se incluyen muchos assets.

Cuándo elegirlo: fase inicial, construir base de usuarios, validar qué juegos traccionan.

### 9.2 Apps separadas (una por juego)

Pros:
- ASO específico: fichas de tienda optimizadas por keyword (“Escoba”, “Brisca”, “Blackjack”).
- Pausas de actualización independientes; campañas específicas.

Contras:
- CPI potencialmente mayor (varias campañas).
- Mantenimiento duplicado.
- Menor cross-venta si no hay ecosistema de cuentas compartidas.

Cuándo elegirlo: cuando un juego supera benchmarks (p. ej., D1>35%, D7>12%, ARPDAU alto) y justifica ficha y UA dedicadas.

### 9.3 Recomendación

Fase 1 (0–2 meses): Hub único “Juegos de Baraja: Truco y Más”.
- Lanza Brisca, Escoba, Crazy Eights, Blackjack, con tutoriales y logros.
- Telemetría por juego: D1/D7/D30, sesiones/día, funnels de tutorial, ARPDAU.

Fase 2 (3–6 meses): si un juego destaca en KPIs → spin-off standalone con ASO dedicado.
- Mantener cross-promo entre hub y stand-alone.

Monetización sugerida:
- Ads con rewarded (boosts, reintentos) + IAP remove-ads por juego o global.
- Skins de cartas/tableros (cosméticos) y paquetes de desafíos semanales.
- Torneos/ligas periódicas (sin apuestas reales) para retención.

---

## 10) Riesgos y mitigaciones

- Fragmentación de UI: estandarizar controles vía `getValidMoves()` y `getUiHints()`.
- Complejidad de estados: BaseGameState + estados específicos discriminados.
- Pesos de assets: lazy-load por juego, compresión, spritesheets compartidos.
- IA pobre: telemetría de decisiones + pruebas A/B de heurísticas.

---

## 11) Criterios de aceptación

- Engine genérico integrable con al menos 2 juegos nuevos sin tocar el core.
- UI host renderiza botones/acciones desde `getValidMoves()` sin lógica ad-hoc.
- KPIs mínimos post-lanzamiento (hub): D1≥30%, sesión ≥5 min, error rate <1%.

---

## 12) Siguientes pasos

1. Refactor mínimo: extraer `BaseGameState` y `GameEngine` interface (8–12 h).
2. Implementar `BriscaEngine` + `BriscaBoard` (40–60 h).
3. Añadir `EscobaEngine` (40–60 h) y UI de mesa/selección múltiple.
4. Integrar selector de juego en SetupScreen y namespacing de progreso.
5. Telemetría básica por juego y tablero de métricas.
6. Campañas de lanzamiento (ASO/creatives) y ciclos de mejora.

---

## 13) Apéndice: mapeo baraja 52→40 (para juegos españoles)

- Opción A: remover 8, 9 y 10 (quedan 40 cartas). 
- Opción B: mapear J=8, Q=9, K=10 según variante (si se requiere conservar 52).

---

## 14) Apéndice: hooks de LiveOps

- Retos diarios por juego; misiones semanales; eventos temáticos.
- Logros coleccionables y rachas; tabla local/global.
- Notificaciones segmentadas por preferencia de juego.

---

Este documento sirve como guía de arquitectura y negocio para escalar el proyecto a multi-juego con mínimo retrabajo, aprovechando la base del Truco y habilitando una línea de títulos atractivos para Venezuela y Chile con baraja 40/52.
