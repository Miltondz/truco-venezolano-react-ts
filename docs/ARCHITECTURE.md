# Truco React TS — Project Architecture and Codebase Index

This document provides a high-level architecture overview, detailed codebase index, runtime configuration model, gameplay and AI engine notes, and guidance for extending and maintaining the project.

Maintenance rule (must-read)
- This is a living document. It MUST be updated whenever significant changes are made to features, architecture, types, runtime configuration, or flows.
- All contributors and assistants SHOULD reference this document first for quick discovery of files and implementation patterns before making changes.

1) Quick start
- Dev server: npm start (Create React App)
- Production build: npm run build
- Public config is read at runtime from:
  - public/config/ai_characters.json
  - public/config/tournament_configuration.json

Notes:
- TypeScript strict mode is enabled.
- CRA serves all files in public/, so JSON placed there can be fetched directly by the app.

2) Directory overview (selected)
- public/
  - config/
    - ai_characters.json: Map keyed by display name. Used to validate and derive AICharacter for tournaments.
    - tournament_configuration.json: Array of tournaments with rounds and opponent names.
  - images/avatars/*.jpg: Avatars (player and AI)
  - images/decks/*: Deck image assets
  - images/backgrounds/*: Board backgrounds
- src/
  - App.tsx: App state, screen routing (string-based), handlers for all gameplay actions, storage integration, audio init.
  - index.tsx: React entrypoint
  - index.css and styles/*: Global and component styles
  - types/index.ts: All core types and constants (GameState, AICharacter, GameSettings, etc.)
  - components/*: UI screens and reusable components
  - utils/*: Game engine (gameLogic), AI strategies, cards, avatar moods, personality, audio, storage
  - data/aiCharacters.ts: Legacy in-code AI characters (used by Setup/OpponentSelector)
  - data/tutorialLessons.tsx: Tutorial lessons content
  - debug/ and docs/: Technical notes and diagnostics (CSS conflicts, technical notes, etc.)

3) State and types (src/types/index.ts)
- GameState
  - Core fields: scores, currentRound/maxRounds, player/computer hands, played cards, isPlayerTurn, selectedOpponent
  - Difficulty: 'easy' | 'medium' | 'intermediate' | 'hard' | 'master'
  - Envido/Truco/Flor: levels, lastCall, waitingForResponse
  - Phases: currentPhase: 'flor' | 'envido' | 'truco' | 'playing'
  - Avatar moods: computerAvatarMood/playerAvatarMood and timers
  - Processing guard: isProcessingAction (blocks double actions)
- GameSettings
  - Audio (volumes, music), UI (darkMode, particles, hdCards), accessibility (largeText, reduceMotion), AI settings
- AICharacter
  - Stats: agresividad, riesgo, blufeo, consistencia
  - difficulty (includes 'intermediate'), personality (balanced/aggressive/conservative/unpredictable)

4) Gameplay engine (src/utils/gameLogic.ts)
- Start and phases
  - initializeGameState: sets initial fields and phase baseline
  - startNewHand: deals cards, calculates envido points, detects flor, sets initial phase ('flor' if any have flor else 'envido')
  - advancePhase: flor → envido → truco → playing
- Actions and calls
  - Truco stack: callTruco → callRetruco → callVale4; set waitingForResponse + lastCall
  - Envido stack: envido → real envido → falta envido; resolved by acceptCall via resolveEnvido
  - Flor: simple or contra flor (if both have flor)
  - Accept/reject: updates points and phases per rules
- Rounds and end
  - playCard/computerPlayCard, evaluateRound updates roundsWon
  - endHand adds points based on currentTrucoLevel (2/3/4) or 1 if simple
  - checkGameEnd: 24 points wins (player/computer)
- Timing and protection
  - getAiDelay: combines aiResponseTime and gameSpeed
  - isProcessingAction and waitingForResponse gates in App handlers

5) AI engine (src/utils/ai.ts)
- Call decisions (getAICallDecision):
  - Considers lastCall, envido/flor situations, hand strength, and score context
  - Personality modulates accept/raise chances (agresividad, intimidacion, calculo, adaptabilidad)
- Card selection (selectBestCardForAI):
  - easy: random
  - medium/intermediate: heuristic with agresividad/calculo
  - hard: improved bluff (intimidacion) and calc-driven
  - master: optimal/minimal winning with strategic sacrifices

6) Personality system (src/utils/personality.ts)
- Predefined archetypes and random generation
- Descriptions, strengths, and weaknesses derived from trait values
- Used both for cosmetic display and to modulate AI logic

7) UI components (selected)
- MainScreen.tsx: Main menu; includes "Jugar Torneo"
- SetupScreen.tsx: Deck/board/opponent selection for quick play (not used in tournaments)
- OpponentSelector.tsx:
  - Uses legacy src/data/aiCharacters.ts (active characters)
  - Displays stats and tags for difficulty/personality
- GameBoard.tsx:
  - Shows hands, played cards, action buttons for calls, state banners, and scoreboards
  - Integrates avatar mood system (utils/avatarMoods)
- AchievementsScreen.tsx:
  - Displays achievements and player statistics (migrated from StatsScreen)
- TournamentsScreen.tsx (runtime config):
  - Fetches public/config/tournament_configuration.json and public/config/ai_characters.json
  - Validates that all tournament opponents exist in AI map
  - On selection, derives AICharacter from AI stats (personality and difficulty derived from traits)
  - Starts game immediately on game-board (skips setup to prevent opponent changes)

8) Runtime configuration model
- Read at runtime via fetch from public/config:
  - tournament_configuration.json: array of tournaments { name, description, activo, rounds, rules, unlockConditions }
  - ai_characters.json: object map keyed by display name; values include stats, avatar, description, activo
- Tournaments screen validates opponents listed in rounds.opponents exist in AI map
- Derivation rules
  - personality (approx.):
    - aggressive: agresividad ≥ 8 and blufeo ≥ 7
    - unpredictable: blufeo ≥ 8 and riesgo ≥ 7
    - conservative: consistencia ≥ 8 and agresividad ≤ 4
    - else: balanced
  - difficulty (approx.): avg(stats)
    - ≤ 3.5: easy, ≤ 5.0: medium, ≤ 6.5: intermediate, ≤ 8.0: hard, else: master

9) Flows
- Quick play:
  - Main → SetupScreen → App.startGame() → initializeGameState → startNewHand → GameBoard
- Tournament:
  - Main → TournamentsScreen → fetch + validate → derive opponent → App.startTournamentWithOpponent() → GameBoard
  - Setup is intentionally skipped to prevent changing the opponent in tournament mode

10) Assets
- Avatars: public/images/avatars
- Decks: public/images/decks
- Boards: public/images/backgrounds
- Avatar fallback paths handled by utils/avatarMoods

11) Known warnings and cleanup suggestions
- Warnings (build):
  - Unused imports/vars (App.tsx, GameBoard.tsx, tutorial files)
  - react-hooks/exhaustive-deps in GameBoard useEffect (consider refactor to avoid loops)
  - no-useless-escape in tutorialLessons strings
- Suggestions:
  - Unify AI source: migrate OpponentSelector to consume public/config/ai_characters.json (remove legacy src/data/aiCharacters.ts)
  - Persist tournament progress (localStorage) and add bracket UI
  - Clean unused imports and variables; update useEffect deps carefully
  - Add tests for tournament flow and personality/difficulty derivation

12) Key files index (quick reference)
- App and entry
  - src/App.tsx — screen routing, game handlers, storage/audio integration, tournament start
  - src/index.tsx — app bootstrap
- Types and constants
  - src/types/index.ts — GameState, GameSettings, AICharacter, etc.
- Screens & components
  - src/components/MainScreen.tsx
  - src/components/TournamentsScreen.tsx
  - src/components/SetupScreen.tsx
  - src/components/OpponentSelector.tsx
  - src/components/GameBoard.tsx
  - src/components/AchievementsScreen.tsx
  - src/components/SettingsScreen.tsx
  - src/components/TutorialScreen.tsx, LessonScreen.tsx, InstructionsScreen.tsx
- Game and AI logic
  - src/utils/gameLogic.ts
  - src/utils/ai.ts
  - src/utils/personality.ts
  - src/utils/cards.ts
  - src/utils/avatarMoods.ts
  - src/utils/sound.ts
  - src/utils/storage.ts
- Runtime config
  - public/config/tournament_configuration.json
  - public/config/ai_characters.json
- Legacy data
  - src/data/aiCharacters.ts (used by OpponentSelector)
  - src/data/tutorialLessons.tsx

13) How to extend
- Tournament progression
  - Persist current tournament, round, and opponent in localStorage
  - On game end, advance to the next opponent/round based on config
  - Provide a simple bracket view (ronda actual y próximas)
- Opponent source unification
  - Replace legacy aiCharacters.ts with the public/config loader everywhere (including SetupScreen)
- Internationalization
  - Centralize UI strings for potential i18n
- Testing
  - Add unit tests around resolveEnvido, endHand, and AI decision thresholds

14) Operational notes for assistants
- Always read tournaments and AI from public/config JSON (runtime)
- For TypeScript changes, ensure GameState and AICharacter remain the single source of truth for state and opponent shape
- When wiring new flows, use App to control screen changes (navigateTo) and game state transitions (initializeGameState → startNewHand)
- Respect isProcessingAction and waitingForResponse to avoid double actions
- If modifying images, keep avatar fallbacks consistent with utils/avatarMoods
