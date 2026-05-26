# AUDIT_PLAN.md

## Executive Summary

The codebase is a CRA + TypeScript implementation of Venezuelan Truco with quick-play, AI personality, tournament, achievements, and avatar mood subsystems. Overall structure is comprehensible and uses runtime-loaded JSON for tournaments/AI characters. The code works but has **several critical correctness bugs, race conditions and architectural issues** that will produce visible gameplay defects and make the system hard to extend.

**Top risks (Critical):**
1. `App.executePlayCard` chains `setState + setTimeout` and re-applies round result twice via both `evaluateRound` (which already increments `roundsWon`) and `applyRoundResult` (which increments again) — **double-counting rounds** and inconsistent score state.
2. AI never actually calls truco/envido/flor or responds to the player. `getAIResponse`/`getAICallDecision` are defined but **never invoked anywhere** — `waitingForResponse=true` after a player call leaves the game permanently stuck until player clicks Quiero/No Quiero on their own call (i.e., the computer never auto-accepts/rejects).
3. `callEstarCantando` (and several other handlers) checks `isPlayerTurn` instead of properly validating phase, leading to disallowed plays going through or being blocked silently.
4. Tournament flow has dual sources of truth (`src/data/aiCharacters.ts` legacy + `public/config/ai_characters.json`). `OpponentSelector` uses legacy file, tournament screens fetch the JSON, so adding/removing an opponent in one place desyncs the other.
5. `useEffect` exhaustive-deps violations + duplicated `setGameState` calls in `avatarMoods.updateAvatarMood` create flicker, stale state, and animation timer leaks.
6. `localStorage` data is loaded via `JSON.parse` with no shape validation and no try/catch in `storage.ts` — a corrupt entry crashes the app at boot.

**Priority distribution:** 6 Critical, 14 High, 16 Medium, 11 Low.

---

## 1. Bugs & Correctness — Priority: Critical / High

### 1.1 Double round counting (Critical)
- **File:** `src/App.tsx:237` and `src/utils/gameLogic.ts:178–180` + `src/utils/gameLogic.ts:556–557`
- **Problem:** `evaluateRound` already mutates `roundsWon` (`newRoundsWon.player++`). The state returned is then passed to `applyRoundResult` (`src/App.tsx:270 → handleRoundResult`), which **again** does `newRoundsWon.player++`. Result: each round is counted twice; hands end after one round instead of two.
- **Fix:** Pick one ownership boundary. Remove the increment from `evaluateRound` (lines 178–180 of `gameLogic.ts`) and let `applyRoundResult` be the sole writer; or alternatively pass `roundWinner` only and stop having `evaluateRound` return a mutated `roundsWon`. Add a Jest test in `src/utils/__tests__/gameLogic.test.ts` asserting that after `evaluateRound + applyRoundResult` on a player win, `roundsWon.player === 1`, not `2`.

### 1.2 AI never responds to calls or initiates them (Critical)
- **File:** `src/utils/ai.ts:1–73` (defined), `src/App.tsx:374–407`, `src/utils/gameLogic.ts:247–345`
- **Problem:** `getAICallDecision` / `getAIResponse` exist but are imported nowhere (`gameLogic.ts:3` imports only `getAIResponse, selectBestCardForAI` but `getAIResponse` is never called in the file). After `handleCallTruco` sets `waitingForResponse=true`, nothing triggers the AI. Also, the AI never canta Truco/Envido on its own turn.
- **Fix:**
  1. In `App.executePlayCard` after `computerPlayCard`, also call a new `aiMaybeCall(state)` that uses `getAICallDecision` to optionally inject `callTruco/callEnvido` before playing the card.
  2. Add `handleAiRespondToPlayerCall` that runs on a `useEffect([gameState.waitingForResponse, gameState.isPlayerTurn])`: if `waitingForResponse && lastCall is a player call`, schedule `setTimeout(aiResolve, getAiDelay)` calling `acceptCall`/`rejectCall`/raise based on `getAICallDecision`.
  3. Lifecycle this from `App.tsx` near the existing handlers (around lines 374–407).

### 1.3 `lastCall === 'vale4'` is dead code (High)
- **File:** `src/utils/ai.ts:29`
- **Problem:** Check for `'vale4'` matches nothing — actual call names are `'valeNueve'` and `'valeJuego'` (see `gameLogic.ts:285, 299`). AI will treat Vale Nueve / Vale Juego the same as no-call.
- **Fix:** Replace `lastCall === 'vale4'` with `lastCall === 'valeNueve' || lastCall === 'valeJuego'` and update branch to weight calculus higher for vale juego.

### 1.4 `callFlor` runs only for player; computer flor never resolved (High)
- **File:** `src/utils/gameLogic.ts:486–512`
- **Problem:** Function early-returns if `!playerHasFlor`. There is no symmetric `computerCallFlor` path nor any logic to award `+3` to the computer when only it has flor. Also `playerHasFlorReservada` is read on line 492 but **never set** anywhere in the codebase — always undefined.
- **Fix:** (a) Add `computerCallFlor` invoked when `computerHasFlor && currentPhase==='flor'` and computer is mano. (b) Wire `playerHasFlorReservada`/`computerHasFlorReservada` from `hasFlor` (detect when both pieces present in `cards.ts:185`). (c) Implement Contra-Flor handling when both have flor (currently only sets `waitingForResponse` without acceptance branching for flor in `acceptCall`).

### 1.5 `acceptCall` for flor never increments score (High)
- **File:** `src/utils/gameLogic.ts:378–383`
- **Problem:** When AI accepts a flor envite, no points are awarded (function just clears `waitingForResponse` and advances phase). Per rules a Contraflor querida awards 6 to winner.
- **Fix:** Add branch `if (gameState.lastCall === 'flor')` inside `acceptCall` that resolves like `resolveEnvido` but compares `playerEnvidoPoints` vs `computerEnvidoPoints` and adds 6 (or whatever Reservada rule dictates).

### 1.6 `foldHand` always awards points to computer regardless of who folds (High)
- **File:** `src/utils/gameLogic.ts:514–526`
- **Problem:** Hardcoded `computerScore + 2`. There is no `aiFold` and the function only fires from player UI, but it ignores in-flight truco state (folding during a Truco offer should award `trucoAcceptedPot` to the opponent, not just `2`).
- **Fix:** Compute pointsToAdd from current `currentTrucoLevel` / `trucoPendingOffer` (use same logic as `rejectCall`) and add to opponent score. Make function symmetric for future AI fold support.

### 1.7 `Estar Cantando` requires `isPlayerTurn` (High)
- **File:** `src/utils/gameLogic.ts:235`
- **Problem:** Player must be at exactly 23 AND on turn, but the rule is purely about score; an off-turn 23 should still allow declaration. Also disabled state of the button in `GameBoard.tsx:334` does not check `currentPhase`.
- **Fix:** Remove `isPlayerTurn` guard; restrict to `gameState.gameInProgress && playerScore === 23 && !waitingForResponse`. Add corresponding AI declaration when `computerScore === 23`.

### 1.8 `handleGameEnd` reads stale `playerStats` (High)
- **File:** `src/App.tsx:288–354`, especially `345–348`
- **Problem:** `newStats.experience += newStats.gamesWon * 10 + newStats.totalPoints` happens after the tournament early-return; for tournament flow stats are never updated. `playerStats` is also used inside `shouldLevelUp` (`App.tsx:519–525`) which closes over the React render-time value, so consecutive level-ups within one game miss.
- **Fix:** Use `setPlayerStats(prev => …)` updater functions throughout and base `shouldLevelUp` on `prev.experience` inside the updater. Move tournament stats update out of the early-return so XP credits.

### 1.9 `executePlayCard` re-uses `gameState` after multiple setState (High)
- **File:** `src/App.tsx:211–267`
- **Problem:** Inside nested `setTimeout` blocks the code closes over the original `gameState` and the in-flight `newGameState`/`computerState`/`evaluatedState` snapshots, never reading the latest React state. If user spams an action just before timeouts fire, the moods/scores are recomputed from stale snapshots. Also, the `evaluateRound` is called on `computerState` whose `playerPlayedCard`/`computerPlayedCard` are correct, but `evaluatedState` is then mutated via `setGameState` and overwritten again 3.5s later with `{ ...evaluatedState, isProcessingAction:false }` — so any state writes between the two `setGameState` calls (e.g. mood updates) get clobbered.
- **Fix:** Refactor to a single `setGameState(prev => …)` reducer chain or move sequence into a reducer (`useReducer`). Eliminate the read-then-write hazard by passing `prev` into every step.

### 1.10 Avatar mood update double-setState race (High)
- **File:** `src/utils/avatarMoods.ts:95–111`
- **Problem:** `setGameState` is called twice in immediate succession (timer setter then mood setter). The second one closes over `prevState` so the moods land, but if React batches, the timer id stored in the first call is overwritten by the second call's spread (since `avatarMoodTimer: timerId` is in the second one). Combined with `clearTimeout(gameState.avatarMoodTimer)` reading the snapshot rather than latest state, timers leak when moods change rapidly.
- **Fix:** Collapse into a single functional updater that returns `{ ...prev, playerAvatarMood/computerAvatarMood, avatarMoodTimer: timerId }`. Move timer creation inside the updater; clear the previous timer using `prev.avatarMoodTimer` (not the captured `gameState`).

### 1.11 `applyRoundResult` ignores tie scoring rule (Medium)
- **File:** `src/utils/gameLogic.ts:559–567`
- **Problem:** When `currentRound >= maxRounds` and both `roundsWon` equal, the function falls through with `handWinner='tie'` and starts a new round (but currentRound is already at max). Truco rule: if all rounds tied, mano wins the hand.
- **Fix:** Add `else handWinner = currentState.manoIsPlayer ? 'player' : 'computer';` for the final-round all-tied case.

### 1.12 `endHand` uses `currentState` not `newRoundsWon` (Medium)
- **File:** `src/utils/gameLogic.ts:569`
- **Problem:** `endHand(currentState, handWinner, settings)` passes the pre-update state, so the `roundsWon` shown in the lore is one round behind. The override `{ ...endState, roundsWon: newRoundsWon }` on line 570 patches the structure but `endHand` did not use `newRoundsWon` to compute anything, so it's fine for score but inconsistent for any future logic.
- **Fix:** Pass `{ ...currentState, roundsWon: newRoundsWon }` into `endHand`.

### 1.13 `currentStreak` / `bestStreak` duplicated in GameState and PlayerStats (Medium)
- **File:** `src/types/index.ts:71–72` and `127–128`
- **Problem:** Both `GameState` and `PlayerStats` carry these fields, with `gameLogic.initializeGameState` resetting them to 0 every game. The "best streak" displayed on AchievementsScreen is the `PlayerStats` one; `GameState` versions are dead writes.
- **Fix:** Remove `currentStreak`/`bestStreak` from `GameState` (lines 71–72). Adjust `initializeGameState` (line 64) accordingly.

### 1.14 `viraCard` non-null assertion can crash (Medium)
- **File:** `src/utils/gameLogic.ts:161`
- **Problem:** `const vira = gameState.viraCard!;` — if `evaluateRound` is called before `startNewHand` (e.g., from a save-restore flow), it crashes. `initializeGameState` returns `viraCard: null` (line 68).
- **Fix:** Guard with early return `if (!gameState.viraCard) return { winner:'tie', gameState };`.

### 1.15 `loadTournamentById` parsing in App differs from DynamicTournamentBracket (Medium)
- **File:** `src/App.tsx:591–607` vs `src/components/DynamicTournamentBracket.tsx:22–38`
- **Problem:** Duplicate implementations; both slug-ify the name to derive id. Tournament IDs in `public/config/tournament_configuration.json` are absent, so id is computed differently if special characters change. Slugs are not normalized for accents (no `NFD`).
- **Fix:** Extract a single `loadTournaments()` helper in `src/utils/tournamentConfig.ts` returning processed list with normalized ids (`NFD` + diacritic strip, matching the slug logic in `TournamentsScreen.tsx:106`).

### 1.16 `nextOpponent` set inside `useMemo` causes render loop risk (High)
- **File:** `src/components/TournamentBracketScreen.tsx:126–131`
- **Problem:** Calling `setNextOpponent` inside `useMemo` is forbidden — it triggers a setState during render, causing extra renders and potentially infinite loops if memo dependencies change after the set.
- **Fix:** Move next-opponent computation out of memo into a `useEffect([progress, characters])` that does `setNextOpponent(...)` once.

### 1.17 Tournament `active` opponent logic is wrong (High)
- **File:** `src/components/TournamentBracketScreen.tsx:114`
- **Problem:** `active = isCurrent && !defeated && defeatedInRound.length === round.opponents.indexOf(opponentName)` — uses positional defeat. If the user defeats opponent #2 before #1 (which the code allows since `nextOpponent` is whoever is `active`), the comparison breaks. Also `defeatedInRound.length === ...indexOf(...)` is fragile when names repeat or order changes.
- **Fix:** Define active as `isCurrent && !defeated && firstUndefeatedIndex === currentIndex`, computed via a single pass.

### 1.18 `handleTournamentGameEnd` reads `gameState.tournamentContext` after game state may have changed (Medium)
- **File:** `src/App.tsx:431–438`
- **Problem:** Function pulls `tournamentId`, `currentRound`, etc. from the captured `gameState`. By the time `handleGameEnd` runs after multiple `setGameState` calls, these may still be the original values, but the early `return` if missing risks silent no-op when the user navigates mid-flow.
- **Fix:** Pass `finalState` from `handleGameEnd` into `handleTournamentGameEnd(playerWon, finalState)` and read context from the parameter, not closure.

### 1.19 `Math.random().sort` shuffle is biased (Medium)
- **File:** `src/utils/cards.ts:54–56`
- **Problem:** `[...cards].sort(() => Math.random() - 0.5)` is a well-known non-uniform shuffle.
- **Fix:** Replace with Fisher-Yates: `for (let i = a.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; }`.

### 1.20 `setGameState(s => ...)` mixed with non-functional updaters in win path (Medium)
- **File:** `src/App.tsx:302–306`
- **Problem:** `updateAvatarMood(finalState, setGameState, true, 'excellent')` is followed by `updateAvatarMood(finalState, setGameState, false, 'terrible')` then `setGameState(s => …)`. The mood updaters use `finalState` as their snapshot, so the second call overwrites the first.
- **Fix:** Convert `updateAvatarMood` to a pure state-transform function and apply both updates in one `setGameState(prev => …)`.

---

## 2. TypeScript Strictness — Priority: High / Medium

### 2.1 `any` parameters (High)
- **File:** `src/utils/gameLogic.ts:24` — `selectedOpponent: any`
- **File:** `src/utils/personality.ts:148` — `opponent: any`
- **File:** `src/App.tsx:527` — `progress: any`
- **File:** `src/components/DynamicTournamentBracket.tsx:9` — `onStartMatch: (opponent: any) => void`
- **Fix:** Type all four as `AICharacter | null` / `TournamentProgress | null`. Update call sites accordingly.

### 2.2 `catch (e: any)` uses (Medium)
- **File:** `src/components/TournamentsScreen.tsx:62`, `src/components/TournamentBracketScreen.tsx:56`
- **Fix:** Use `catch (e: unknown)` and narrow with `e instanceof Error ? e.message : String(e)`.

### 2.3 Non-null assertions (Medium)
- **File:** `src/utils/gameLogic.ts:161` (`gameState.viraCard!`)
- **Fix:** Replace with proper guard (see 1.14).

### 2.4 Unsafe `as unknown as number` cast for timeout id (Low)
- **File:** `src/utils/avatarMoods.ts:102`
- **Problem:** `setTimeout(...) as unknown as number` masks that browser `setTimeout` returns `number`, but the cast suggests confusion. Already correct, but combined with stored-in-GameState pattern it leaks.
- **Fix:** Type `avatarMoodTimer` as `ReturnType<typeof setTimeout> | null` in `src/types/index.ts:80`.

### 2.5 Local `Tournament` type shadows global (Medium)
- **File:** `src/components/TournamentsScreen.tsx:17–24` redefines `Tournament` and `TournamentRound` locally, drifting from `src/types/index.ts:222–243` (which already includes `id`).
- **Fix:** Delete local types, import from `../types`.

### 2.6 `personaje` field in JSON not in TS type (Medium)
- **File:** `src/components/TournamentsScreen.tsx:31` declares `personaje: string`, but `AICharacter` in `src/types/index.ts:23–35` uses `name`. JSON ships `personaje`, code uses the map key for name. Confusing dual-naming.
- **Fix:** Rename JSON field to `name` (or drop `personaje` and rely on key) and update `AICharactersMap` shape, both in `TournamentsScreen.tsx` and `TournamentBracketScreen.tsx`.

### 2.7 `gameState.aiPersonality` Hungarian-style optional fields missing (Low)
- **File:** `src/types/index.ts:13–20`
- **Problem:** `AIPersonality.archetype` is required but `generateRandomPersonality` returns `'Personalizado'` and `convertOpponentToPersonality` passes opponent name — okay, but `archetype` is sometimes used as display name (line 88 of GameBoard) — better to split label from archetype id.
- **Fix:** Add `displayName?: string` and use that for UI.

### 2.8 Lots of inline literal types instead of enums (Low)
- **File:** `src/types/index.ts:33, 47, 84, 107, 192, 273` and many string union duplications across screens.
- **Fix:** Centralize via `export type Difficulty = 'easy'|'medium'|'intermediate'|'hard'|'master';` and reuse.

### 2.9 `tournamentStats` is inline-typed in App (Medium)
- **File:** `src/App.tsx:79–86`
- **Fix:** Add `TournamentStats` interface in `types/index.ts` and use it in state + `checkTournamentAchievements` signature.

---

## 3. Architecture & Coupling — Priority: Critical / High

### 3.1 App.tsx is a god component (Critical)
- **File:** `src/App.tsx` — 760 lines holding routing, gameplay orchestration, victory splash state, tournaments, persistence, audio init.
- **Fix:** Extract into:
  - `src/hooks/useGameOrchestrator.ts` — owns `gameState`, `handlePlayCard`, `executePlayCard`, `handleRoundResult`, `handleGameEnd`, all `handleCall*`.
  - `src/hooks/useTournamentFlow.ts` — owns `tournamentStats`, `startTournamentMatch`, `handleTournamentGameEnd`, achievements check, `loadTournamentById`.
  - `src/hooks/usePersistence.ts` — owns settings/stats/achievements load + autosave.
  - `src/router/Router.tsx` — string-based `currentScreen` switch.
  Keep `App.tsx` as the composition root.

### 3.2 AI source split (legacy vs config JSON) (Critical)
- **File:** `src/data/aiCharacters.ts` (290 lines) used only by `OpponentSelector.tsx:3,14`. `public/config/ai_characters.json` is the runtime source used by tournaments. Both list the same characters with identical fields under different naming conventions.
- **Fix:**
  1. Refactor `OpponentSelector` to accept `characters: AICharacter[]` via prop OR to fetch from `/config/ai_characters.json` itself.
  2. Add `src/utils/aiCharactersLoader.ts` exporting `loadAICharacters()` + `toAICharacter(name, raw)` (consolidating duplication in `TournamentsScreen.tsx:105–120` and `TournamentBracketScreen.tsx:84–99`).
  3. Delete `src/data/aiCharacters.ts` after migration.

### 3.3 Prop drilling of `gameState/setGameState/gameSettings` (High)
- **File:** `src/App.tsx:644–665` passes 16+ props to `GameBoard`; same pattern for `SetupScreen` (line 645).
- **Fix:** Introduce `GameContext` (`React.createContext`) providing `{state, dispatch, settings, setSettings}`. Use a `useReducer` for game state (see 1.9). Components consume via `useGame()` hook.

### 3.4 Duplicate `derivePersonality` / `deriveDifficulty` / `toAICharacter` (High)
- **File:** `src/components/TournamentsScreen.tsx:88–120` and `src/components/TournamentBracketScreen.tsx:67–99` — identical functions.
- **Fix:** Move to `src/utils/aiCharactersLoader.ts`; import both places.

### 3.5 `loadTournamentById` duplicated (Medium)
- **File:** `src/App.tsx:591–607` and `src/components/DynamicTournamentBracket.tsx:22–38`.
- **Fix:** Single helper in `src/utils/tournamentConfig.ts`.

### 3.6 String-based router with stringly-typed screen names (Medium)
- **File:** `src/App.tsx:172, 639–682` — `navigateTo('tournament-bracket-xxx')` parsed with `startsWith`.
- **Fix:** Either adopt `react-router-dom` (small dep) or define `type Screen = 'main'|'setup'|… | {kind:'tournament-bracket', id:string}` and a typed `navigate(screen: Screen)` function.

### 3.7 `tournamentStorage` writes whole state on every action (Medium)
- **File:** `src/utils/tournamentStorage.ts:33–45, 109, 136, 178`
- **Problem:** Every defeat/round update reads+writes the entire JSON blob. With many tournaments this is O(n) per call.
- **Fix:** Cache `currentState` in module scope and persist on a debounced schedule, or only persist the diffed tournament key.

### 3.8 `evaluateRound` mixes domain logic with sound effects (Medium)
- **File:** `src/utils/gameLogic.ts:169–176`
- **Problem:** `playSound` is called from pure-ish reducer functions, making them impossible to test deterministically and bypassing the React render cycle.
- **Fix:** Return `{ winner, gameState, soundsToPlay: string[] }` and let the caller in `App.tsx` play sounds.

### 3.9 No central event bus for lore (Low)
- **File:** `gameLogic.ts` scatters `activeCalls: capLore([...])` in 8+ places.
- **Fix:** Introduce `pushLore(state, msg)` helper (already exists as `addLore` at line 10) — replace all inline duplications.

---

## 4. Performance — Priority: Medium / High

### 4.1 Exhaustive-deps suppressed implicitly (High)
- **File:** `src/components/GameBoard.tsx:34–42`
- **Problem:** `useEffect(() => {...}, [gameState.isPlayerTurn, gameState.currentRound])` calls `resetAvatarsToDefault(gameState, setGameState)` — `gameState` and `setGameState` are missing from deps, plus calling `setGameState` inside without functional updater can loop with mood-change effect on line 40.
- **Fix:** Use functional updater inside `resetAvatarsToDefault`; drop captured `gameState`; add eslint-disable with justification OR refactor to use `useRef` for prev turn detection.

### 4.2 `useEffect` re-runs OpponentSelector init loop (Medium)
- **File:** `src/components/OpponentSelector.tsx:19–29`
- **Problem:** Dependency array `[selectedOpponent, activeCharacters, onOpponentSelect]` — `onOpponentSelect` is recreated each render in parent (SetupScreen passes inline lambda? Actually it passes `handleOpponentSelect` defined inline `const handleOpponentSelect = (opponent) => …` — new ref each render), so effect runs every render.
- **Fix:** Wrap `handleOpponentSelect` in `useCallback` in `SetupScreen.tsx:57`. Also `useMemo([])` on `getActiveAICharacters()` to avoid recompute.

### 4.3 `LorePanel` receives ever-growing list cap 50 (Low)
- **File:** `src/utils/gameLogic.ts:8` and `src/components/LorePanel.tsx`
- **Problem:** Each call rebuilds `activeCalls` array; LorePanel likely renders all 50 elements every state change.
- **Fix:** Memoize lore items by index/content; pass only last N to render.

### 4.4 Inline object styles re-allocate every render (Medium)
- **File:** `src/components/TournamentBracketScreen.tsx:223–252` (heavy inline styles); `GameBoard.tsx:165–175`, `SetupScreen.tsx:175`, `TournamentsScreen.tsx:228–237`.
- **Fix:** Move inline style objects to CSS classes in existing `src/styles/` files; reduces React reconciliation cost and improves dark/light theme consistency.

### 4.5 `console.log` in hot paths (Medium)
- **File:** `src/App.tsx:32, 186–190, 528 (implied via debug branches)`, `src/components/GameBoard.tsx:28`, `src/components/SetupScreen.tsx:58, 81–86`, `src/utils/gameLogic.ts:32–35`.
- **Problem:** Debug logs in production runs; some log every render (`GameBoard.tsx:28` logs every render).
- **Fix:** Replace with `if (process.env.NODE_ENV !== 'production') console.log(...)` guarded helper in `src/utils/debug.ts`, or strip in build.

### 4.6 `gameSettings, playerStats, achievements` auto-save effect (Low)
- **File:** `src/App.tsx:163–169`
- **Problem:** Writes localStorage on every state change with no debounce. During gameplay achievements rarely change but stats can change with each game end — minor.
- **Fix:** Debounce via `setTimeout` (200ms) or split into three effects keyed on each piece.

### 4.7 `shuffleDeck` recreates 40-card array on every hand (Low)
- **File:** `src/utils/cards.ts:54`
- **Fix:** Acceptable for 40 cards; only worth changing if profiling shows pressure.

### 4.8 `Set` re-created in `useMemo` correctly but `aiNames` consumed only in another memo (Low)
- **File:** `src/components/TournamentsScreen.tsx:72–86` — fine.

---

## 5. Accessibility — Priority: High / Medium

### 5.1 Modal not keyboard-trappable / not Esc-dismissible (High)
- **File:** `src/components/Modal.tsx:10–28`
- **Problem:** No `role="dialog"`, no `aria-modal`, no focus trap, no `Escape` key handler. Background scroll not locked.
- **Fix:** Add `role="dialog" aria-modal="true" aria-labelledby="modal-title"`, focus first button on mount via `useRef`, handle `keydown` Escape → `onCancel`, lock body scroll on mount.

### 5.2 Notification has no `role="status"` / `aria-live` (High)
- **File:** `src/components/Notification.tsx:11`
- **Problem:** Screen readers won't announce success/error toasts.
- **Fix:** Add `role="status" aria-live="polite"` for `info/success`, `role="alert" aria-live="assertive"` for `error`.

### 5.3 Game action buttons rely on emoji-only labels (Medium)
- **File:** `src/components/GameBoard.tsx:231–339` — buttons like `✅ Quiero`, `🎵 Envido`. Screen reader users get "white heavy check mark, Quiero" which is okay, but icon-only `🚪 Me Voy` is unclear.
- **Fix:** Add `aria-label` and/or wrap icons in `<span aria-hidden="true">`. Add `aria-pressed` for stateful buttons.

### 5.4 Personality indicator clickable `<div>` not a button (Medium)
- **File:** `src/components/GameBoard.tsx:160` — `<div className="personality-indicator" onClick={...}>`.
- **Fix:** Convert to `<button type="button">` for keyboard accessibility and screen reader semantics.

### 5.5 Card clickable `<div>` (High)
- **File:** `src/components/Card.tsx:25–30` — `<div className="card" onClick={...}>`.
- **Problem:** Not keyboard accessible; cannot Tab to focus or press Enter to play. The whole gameplay is unusable without a mouse.
- **Fix:** Convert wrapper to `<button>` when `onClick` provided; add `aria-label={card.name}`. Otherwise leave as `<div role="img">`.

### 5.6 Tournament card clickable `<div>` (Medium)
- **File:** `src/components/TournamentsScreen.tsx:146–198`, `TournamentBracketScreen.tsx:218–276`.
- **Fix:** Convert to `<button>` or add `role="button" tabIndex={0} onKeyDown={Enter/Space → handleSelect}`.

### 5.7 Images missing alt or have non-descriptive alt (Low)
- **File:** `src/components/MainScreen.tsx:42` (`alt="Truco Venezolano Background"` — okay), `src/components/GameBoard.tsx:134` (good), but deck previews `SetupScreen.tsx:136` use `alt="Preview default"` — could be more descriptive.
- **Fix:** Use `alt={`Vista previa de baraja ${deckName}`}` etc.

### 5.8 `largeText` / `highContrast` / `reduceMotion` settings exist but unused (Medium)
- **File:** `src/types/index.ts:108–110`, settings persisted but no CSS class is added to body when active.
- **Fix:** In `App.tsx` add `useEffect([gameSettings.largeText, ...])` that toggles `document.body.classList` (`a11y-large-text`, `a11y-high-contrast`, `a11y-reduce-motion`); define corresponding CSS in `src/styles/App.css`.

### 5.9 Color-only conveyance for tournament round status (Medium)
- **File:** `src/components/TournamentBracketScreen.tsx:223–272` — borders + colors only indicate state.
- **Fix:** Add textual badges (already partially present); ensure ARIA labels include "completada", "actual", "pendiente".

### 5.10 Disabled buttons get `display:none` instead of stay-visible-disabled (Medium)
- **File:** `src/components/GameBoard.tsx:236, 245, 254, 263, …`
- **Problem:** Toggling between `display: none` and `display: block` instead of relying on `disabled` makes the UI jump. Focus jumps unpredictably.
- **Fix:** Remove inline `style.display`; let CSS handle `:disabled` styling. Keep buttons rendered (or use `visibility:hidden`).

---

## 6. Security — Priority: High / Medium

### 6.1 `localStorage` JSON.parse with no try/catch (High)
- **File:** `src/utils/storage.ts:13–34` — `JSON.parse(saved)` directly.
- **Problem:** A single corrupt key crashes app boot inside `App.useEffect`. No shape validation; a malicious user (or earlier-version stale data) can inject any shape.
- **Fix:** Wrap each `loadX` in try/catch returning null; add `zod` (or hand-rolled) validators for `GameSettings`, `PlayerStats`, `Record<string, Achievement>`. Version the keys (`trucoSettings:v2`).

### 6.2 `importData` accepts any JSON without validation (High)
- **File:** `src/utils/storage.ts:48–61`
- **Problem:** Imports raw user JSON straight into stats/settings/achievements.
- **Fix:** Validate shapes before persisting; reject unknown keys.

### 6.3 Fetch from public/config has no cache-busting in some callers (Low)
- **File:** `src/components/TournamentBracketScreen.tsx:51` uses `fetch('/config/ai_characters.json')` with default cache; `TournamentsScreen.tsx:50–51` uses `cache:'no-cache'`. Inconsistency means stale data possible.
- **Fix:** Standardize on `cache:'no-cache'` or version the URL `?v=…`.

### 6.4 Tournament JSON loaded from arbitrary path; no signature (Low)
- **Problem:** If user modifies served JSON via a service worker / proxy, they can inject opponent names that map to non-existent characters and break the flow. Validation exists (`TournamentsScreen.tsx:74–86`) but `DynamicTournamentBracket` does not re-validate before starting.
- **Fix:** Re-run validation in `DynamicTournamentBracket.useEffect` and refuse to start if invalid.

### 6.5 No XSS in current code (Low)
- All user-shown strings come from JSON config or game state — no `dangerouslySetInnerHTML`. However, lore strings are concatenated from card names; if AICharacter JSON is editable on-disk (it is in `public/`), a description could include HTML. React escapes by default, so fine — but document this assumption.

### 6.6 `audioContext` global state never closed (Low)
- **File:** `src/utils/sound.ts:6–33`
- **Problem:** `audioContext` is created at init but never `close()`d on unmount. In SPAs not a leak, but minor.
- **Fix:** Optional `disposeAudio()` exported for tests.

### 6.7 Inline event handler in image error swallows everything (Low)
- **File:** `src/components/TournamentBracketScreen.tsx:262–265`
- **Problem:** `onError` always falls back to `avatar1-default.jpg` regardless of which file failed; can loop if that file also missing.
- **Fix:** Guard with `if (img.src.includes('avatar1-default.jpg')) return;`.

---

## 7. Code Quality — Priority: Medium / Low

### 7.1 Unused imports in App.tsx (Medium)
- **File:** `src/App.tsx:4` imports `applyRoundResult` (used), `callValeNueve`, `callValeJuego`, `callRealEnvido`, `callFaltaEnvido`, `callEstarCantando` (all used), but also imports `startTournament` (line 7) which is unused in `App.tsx` — it's used inside `DynamicTournamentBracket` only.
- **File:** `src/App.tsx:8` imports `calculateHandStrength` — not referenced.
- **Fix:** Remove unused imports; turn ESLint `no-unused-vars` to error to prevent regressions.

### 7.2 `getAIResponse` unused after import (Medium)
- **File:** `src/utils/gameLogic.ts:3` imports `getAIResponse` but never calls it. See bug 1.2.
- **Fix:** Use it via the AI orchestration described in 1.2, or remove import.

### 7.3 Console.log debug noise (Medium)
- **Files:** `src/App.tsx:186–190`, `src/components/GameBoard.tsx:28`, `src/components/SetupScreen.tsx:58, 81–86`, `src/utils/gameLogic.ts:32–35`.
- **Fix:** Remove or wrap in NODE_ENV check (see 4.5).

### 7.4 Magic numbers throughout (Low)
- **Files:** `gameLogic.ts:208, 222, 244, 597` (`24`, `Math.max(500, ...)`, `+2000`), `App.tsx:264, 391` (3500, 3200 ms delays), `avatarMoods.ts:102` (8000).
- **Fix:** Centralize in `src/constants/timing.ts` (`HAND_END_PAUSE_MS=4000`, `ROUND_END_PAUSE_MS=3500`, `MAX_SCORE=24`, etc.).

### 7.5 `personality.ts` exports unused archetype generator (Low)
- **File:** `src/utils/personality.ts:62, 82` — `generatePersonalityFromArchetype` and `getRandomArchetypeName` exported but only the latter is imported by `gameLogic.ts:5` (which doesn't use it).
- **Fix:** Verify call sites with grep; remove or wire up.

### 7.6 `tournamentStorage` exports unused functions (Low)
- **File:** `src/utils/tournamentStorage.ts:75–111, 188–211, 214–243` — `updateTournamentProgress`, `getAllActiveTournaments`, `isTournamentCompleted`, `setCurrentActiveTournament`, `getCurrentActiveTournament`, `resetTournamentProgress`, `clearAllTournamentProgress` not all used.
- **Fix:** Mark intentional with `/** @public */` JSDoc; remove genuinely dead ones.

### 7.7 README cleanup suggestions from `docs/ARCHITECTURE.md` (Medium)
- **File:** `docs/ARCHITECTURE.md:131–139` lists known warnings: unused imports/vars, `react-hooks/exhaustive-deps` in GameBoard, `no-useless-escape` in tutorialLessons. Many still present.
- **Fix:** Address each per items 4.1, 7.1; check `src/data/tutorialLessons.tsx` for regex escape warnings.

### 7.8 `cards.ts` `getPericoCard` duplicates logic with `getPericoPericaForVira` (Medium)
- **File:** `src/utils/cards.ts:199–217` (display) vs `59–75` (game logic).
- **Problem:** `getPericoCard` returns a "next lower" card for UI purposes but `getPericoPericaForVira` uses Caballo/Sota rule. Two different pericos coexist; `gameLogic.startNewHand:84` calls `getPericoCard` for `pericoCard` field, which is then unused for scoring (scoring uses `getPericoPericaForVira` via `isPerico`).
- **Fix:** Either delete `pericoCard` from GameState (if unused for display) or align with the gameplay perico definition.

### 7.9 `viraCard` set to `null` initially but functions assume non-null (Medium)
- See 1.14. Document invariant: `viraCard` always non-null after first `startNewHand`.

### 7.10 `TestRunner.tsx` / `TestScreen.tsx` ship in production (Low)
- **File:** `src/components/TestRunner.tsx`, `src/components/TestScreen.tsx`, `src/utils/testFramework.ts`, `App.tsx:24, 678–679`
- **Fix:** Gate the `test-screen` route behind `NODE_ENV !== 'production'` and lazy-load.

### 7.11 `tournamentStats` shape `fastestTournament: number` initialized to 0 means "no record" (Low)
- **File:** `src/App.tsx:84, 481–484`
- **Fix:** Use `null` (`number | null`) for clarity.

### 7.12 `GameState.pericoCard` field declared (Low)
- **File:** `src/types/index.ts:76`
- **Problem:** Set but rendered nowhere.
- **Fix:** Either expose in `GameBoard` (show vira/perico card next to deck) or remove.

---

## 8. UX & Game Correctness — Priority: Critical / High / Medium

### 8.1 Game stuck after player canta (Critical)
- See 1.2. From a user perspective, after pressing Truco, AI never responds; player can press Quiero/No Quiero on their own call (which the executeProtectedAction guards allow when waitingForResponse is true). This makes the call mechanic functionally broken.
- **Fix:** Implement AI response path as in 1.2. Add a visible "AI thinking…" overlay during the response wait.

### 8.2 Phase transitions allow Envido after first card played (High)
- **File:** `src/components/GameBoard.tsx:235` — Envido button shown when `currentPhase === 'envido'`. But `startNewHand` sets phase to `'envido'` unconditionally if no flor. After the first card is played, phase should advance to `'truco'`. Currently nothing advances `currentPhase` from `'envido'` → `'truco'` unless an envido is called and accepted/rejected (`resolveEnvido` line 481, `rejectCall` line 403).
- **Fix:** In `playCard` (`gameLogic.ts:120`), if `currentPhase === 'envido'` and no envido in flight, set `currentPhase = 'truco'`. Same for flor → envido when first card played without anyone calling flor.

### 8.3 Flor button can be missed (High)
- **File:** `gameLogic.ts:116` — phase starts as `'flor'` only if any has flor. UI shows Flor button only during phase `'flor'`. But there's no transition from flor → envido unless `callFlor` runs. If player has flor and chooses not to call it (waits for envido), they're stuck.
- **Fix:** Add "Pasar Flor" button or auto-advance flor → envido after a timeout (e.g., 5s with `aiResponseTime`).

### 8.4 Tournament round cannot be retried after losing (High)
- **File:** `src/App.tsx:330–341` — on player loss in tournament: `handleTournamentGameEnd(false)` returns without setting any UI state. The match-played counter increments but the player is just navigated back to bracket with no penalty/feedback.
- **Fix:** Show a "Has perdido contra X. Reintentar?" splash; consume a life or restart round depending on rules.

### 8.5 `Me Voy` (fold) followed by auto-`startNewHand` after 3.2s (Medium)
- **File:** `src/App.tsx:387–393`
- **Problem:** Hardcoded delay; user may not have time to read the lore "Me voy al mazo: +2 para Computadora" before deck reshuffles. Also doesn't check if game ended (24 points threshold) before starting new hand.
- **Fix:** Use `applyRoundResult`/`endHand` path so the score-check + game-end-splash are unified. Replace with a "Nueva mano" button or longer delay (5s).

### 8.6 Victory splash navigation logic non-deterministic (Medium)
- **File:** `src/App.tsx:741–751`
- **Problem:** `onDismiss` navigates based on `activeTournament` snapshot. If `setActiveTournament(null)` ran in between, navigation goes to main-screen even mid-tournament.
- **Fix:** Capture target navigation at the time `setVictoryState` is called by including `nextScreen` field in the state object.

### 8.7 `confirmMoves` confirmation modal cannot show during action processing (Medium)
- **File:** `src/App.tsx:196–209`
- **Problem:** Modal appears for player card play, but the `executePlayCard` checks `isProcessingAction` only; if processing, the confirm modal still opens but the inner `executePlayCard` will silently no-op. User confusion.
- **Fix:** Check `isProcessingAction || waitingForResponse` at the top of `handlePlayCard` before opening modal.

### 8.8 Timing guards use `setTimeout` without cleanup (Medium)
- **File:** `src/App.tsx:226, 236, 260, 281, 333, 390`
- **Problem:** If user navigates away from game-board mid-sequence, timers continue and may call `setGameState` on unmounted screens (well, App is always mounted, but state writes happen mid-navigation, breaking flow).
- **Fix:** Track active timers in a `useRef<Set<number>>` cleared on screen change or in a `useEffect` cleanup.

### 8.9 Avatar mood timers leak across navigation (Medium)
- **File:** `src/utils/avatarMoods.ts:95–111`
- **Problem:** `setTimeout` to reset mood is created in `App` lifetime; if user pauses + navigates, timer fires later.
- **Fix:** Cleanup in `GameBoard.useEffect` return: `if (gameState.avatarMoodTimer) clearTimeout(gameState.avatarMoodTimer)`.

### 8.10 `lastCall` not cleared on accept of truco (Medium)
- **File:** `src/utils/gameLogic.ts:368–375` — accept truco sets `waitingForResponse:false` and updates pot but does NOT clear `lastCall`. Next AI/player call decision logic might still see "truco" as pending.
- **Fix:** Add `lastCall: null` to truco-accept return.

### 8.11 No way to cancel `Pausa` modal (Medium)
- **File:** `src/components/GameBoard.tsx:352–366` — Pause modal has only "Continuar" / "Volver al Menú". Esc key does nothing. Background not click-to-dismiss.
- **Fix:** Add Esc handler → `handleResume`; also pause AI timers (currently `isPaused` is local state never gating gameplay timers — pausing does NOT pause the game!).

### 8.12 Pause is fake (High)
- **File:** `src/components/GameBoard.tsx:30, 68–73`
- **Problem:** `isPaused` only toggles modal visibility; AI timeouts in App continue. Player sees AI play cards while "paused".
- **Fix:** Lift pause into App state, gate all `setTimeout` callbacks with `if (gameStateRef.current.isPaused) return;` or store pending action in ref to resume later.

### 8.13 Mobile detection by width listener (Low)
- **File:** `src/components/MainScreen.tsx:8–17`
- **Problem:** Re-renders on every resize; should be throttled and useMatchMedia preferred.
- **Fix:** Use `window.matchMedia('(max-width: 768px)')` + `addEventListener('change')`.

### 8.14 No "concede game" option (Low)
- **Fix:** Add to pause modal: "Rendirme" which awards win to opponent and ends game.

### 8.15 Falta envido point calculation wrong when neither has score (Medium)
- **File:** `src/utils/gameLogic.ts:447–449` — `pointsToAdd = Math.max(1, 24 - leaderScore)`. If both at 0, awards 24 (i.e. game-winning). Rule: Falta Envido = points needed by leader to win, so this is technically correct, but combined with no opponent-side check it instantly ends the game on first envido. Confirm against rules; if intended, fine — but UX warning is needed.
- **Fix:** Show warning modal "Falta Envido vale 24 puntos en este momento — continuar?" before final commit.

### 8.16 Suit naming inconsistency (Low)
- **File:** `src/types/index.ts:316–321` maps `bastos→treboles`, `oros→diamantes`, `copas→corazones` for filenames. Cards type says `bastos/oros/copas` (Spanish deck), but files use French suit names. Mixed terminology will confuse future contributors. Document or unify.

---

## Execution Order Recommendation (for Sonnet)

1. **Round-1 fixes (game must work):** 1.1, 1.2, 1.3, 1.7, 8.1, 8.2, 8.10, 8.12.
2. **Stability:** 1.9, 1.10, 1.14, 4.1, 6.1.
3. **Architecture cleanup:** 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.3.
4. **A11y pass:** 5.1, 5.2, 5.5, 5.10, 5.8.
5. **Type tightening:** 2.1, 2.5, 2.6, 2.9.
6. **Polish:** rest of Section 4, 7, 8.

Each fix should land with: (a) a unit test where possible (`src/utils/__tests__/...`); (b) updated `docs/ARCHITECTURE.md`; (c) no new ESLint warnings.
