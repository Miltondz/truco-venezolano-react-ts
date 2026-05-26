# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server (CRA, port 3000)
npm run build      # production build
npm test           # jest watch mode
npm test -- --testPathPattern=<file>  # single test file
```

TypeScript strict mode is on. No eject — uses react-scripts.

## Architecture

Full codebase index lives in `docs/ARCHITECTURE.md` — read it first before making changes.

### Screen routing

`src/App.tsx` owns all state and routing. Navigation is string-based (`navigateTo(screen)`), no react-router. App also holds all game action handlers and wires audio/storage init.

### Game flow

**Quick play:** MainScreen → SetupScreen → `App.startGame()` → `initializeGameState` → `startNewHand` → GameBoard

**Tournament:** MainScreen → TournamentsScreen → fetch + validate config → `App.startTournamentWithOpponent()` → GameBoard (setup screen is intentionally skipped in tournament mode)

### Core modules

| File | Role |
|------|------|
| `src/types/index.ts` | Single source of truth for all types (GameState, AICharacter, GameSettings) |
| `src/utils/gameLogic.ts` | Full game engine: deal, phases, truco/envido/flor stacks, round eval, scoring |
| `src/utils/ai.ts` | AI call decisions and card selection (easy→master strategies) |
| `src/utils/personality.ts` | AI personality archetypes and trait-driven modulation |
| `src/utils/avatarMoods.ts` | Avatar mood transitions and fallback paths |

### Runtime config (read at runtime via fetch, not bundled)

- `public/config/ai_characters.json` — AI opponent map keyed by display name
- `public/config/tournament_configuration.json` — tournament/round definitions

Tournaments screen validates all opponent names against the AI map before starting.

### Critical guards

- `isProcessingAction` and `waitingForResponse` in GameState gate all action handlers — always respect them to avoid double actions.
- Avatar fallback paths are managed by `utils/avatarMoods`; keep consistent when adding images.

### AI source split (known tech debt)

`src/data/aiCharacters.ts` is legacy — only used by `OpponentSelector` for quick play. Tournaments use `public/config/ai_characters.json`. Goal is to unify to the config file.
