# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **Truco Venezolano** card game implementation built with React and TypeScript. The application is a complete digital recreation of the traditional Venezuelan card game, featuring:

- Single-player game against AI with multiple difficulty levels
- Complete Truco rules implementation (Truco, Envido, Flor mechanics)
- Sophisticated AI with personality traits that affect decision making
- Visual design inspired by Balatro with a dark theme
- Comprehensive statistics, achievements, and settings system
- Sound system with procedural audio generation
- Tutorial and instructions systems

## Development Commands

### Core Development
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject Create React App configuration (irreversible)
npm run eject
```

### Testing Commands
```bash
# Run all tests
npm test

# Run tests in watch mode (default)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- --testNamePattern="App"
```

## Architecture Overview

### State Management
The application uses React hooks for state management with three main state objects:

1. **gameState** (`GameState`): Current game state including cards, scores, turns, AI personality
2. **gameSettings** (`GameSettings`): User preferences and configuration options
3. **playerStats** (`PlayerStats`): Persistent player statistics and achievements

### Core Game Logic Flow
1. Game initialization with AI personality generation
2. Hand dealing with Spanish 40-card deck (no 8s, 9s)
3. Envido/Flor calling phase (optional betting)
4. Three-round card play phase
5. Round evaluation based on card hierarchy
6. Hand conclusion and scoring
7. Game end check (first to 24+ points wins)

### Key Components Structure

- **App.tsx**: Main application orchestrator, handles all state and screen navigation
- **MainScreen**: Home menu with navigation options
- **SetupScreen**: Deck and board selection
- **DifficultyScreen**: AI difficulty and avatar selection
- **GameBoard**: Main game interface during play
- **Tutorial/Instructions**: Learning systems

### AI System Architecture

The AI system has four difficulty levels with sophisticated personality traits:

- **Easy**: Random play with hints enabled
- **Medium**: Basic strategy with personality influence
- **Hard**: Advanced strategy with bluffing capabilities
- **Master**: Optimal play with sophisticated bluffing

**AI Personality System** (`AIPersonality`):
- `agresividad` (1-10): Calling frequency and betting aggression
- `intimidacion` (1-10): Bluffing and psychological tactics
- `calculo` (1-10): Mathematical analysis and probability
- `adaptabilidad` (1-10): Strategy adjustment based on game state

### Card System
- Spanish 40-card deck with specific Truco hierarchy
- Card power values determine round winners
- Envido point calculation for same-suit combinations
- Vira/Perico system for trump card mechanics

## File Structure Guide

```
src/
├── components/           # React UI components
│   ├── App.tsx          # Main app orchestrator
│   ├── GameBoard.tsx    # Primary game interface
│   ├── MainScreen.tsx   # Home menu
│   ├── [Screen]*.tsx    # Various app screens
│   └── [UI]*.tsx        # Reusable UI components
├── types/
│   └── index.ts         # All TypeScript interfaces and types
├── utils/
│   ├── gameLogic.ts     # Core game rules and mechanics
│   ├── ai.ts            # AI decision-making algorithms
│   ├── cards.ts         # Card definitions and utilities
│   ├── personality.ts   # AI personality generation
│   ├── sound.ts         # Audio system with Web Audio API
│   └── storage.ts       # localStorage persistence
└── assets/              # Static resources (images, etc.)
```

## Key Development Patterns

### State Updates
All game state changes flow through the main App component. Use the provided handler functions rather than directly mutating state:

```typescript
// Correct - use provided handlers
const handlePlayCard = (cardIndex: number) => {
  executePlayCard(cardIndex);
};

// Avoid - direct state mutation
setGameState({...gameState, playerPlayedCard: card});
```

### AI Decision Making
AI responses are calculated using the personality trait system. When modifying AI behavior:

1. Consider all four personality traits
2. Factor in difficulty level
3. Account for current game state (score, round, hand strength)
4. Maintain realistic human-like decision patterns

### Sound System
The application uses procedural audio generation via Web Audio API. Sound calls should respect user settings:

```typescript
playSound('cardPlay', gameSettings); // Always pass settings
```

### Component Navigation
Screen navigation is centralized through the `navigateTo` function which handles sound effects and state transitions.

## Testing Considerations

- The codebase includes test utilities (`testRunner.ts`, `testFramework.ts`)
- Tests should cover game logic edge cases (ties, special card combinations)
- AI behavior should be tested with different personality configurations
- State persistence should be verified for settings and statistics

## Performance Considerations

- Game state updates trigger AI calculations - consider timing impacts
- Card image loading uses lazy loading patterns
- Audio generation happens on-demand to avoid memory issues
- localStorage operations are batched for auto-save functionality

## Game Rules Implementation

### Critical Rule Implementations
- **Card Hierarchy**: Strict Truco Venezolano card power values
- **Envido Calculation**: Same-suit card combinations with +20 rule
- **Flor Detection**: Three cards of same suit = automatic 3 points
- **Scoring System**: Different point values for Truco levels, Envido types
- **Win Conditions**: First to 24+ points (not 30 as mentioned in README)

### Special Cases to Handle
- Tie rounds and tie-breaking logic
- Vira/Perico trump card effects
- "Estar Cantando" (23 points rule)
- Multiple simultaneous call types (Envido + Truco)

## Development Notes

- The game uses a fixed 1280x720 canvas area for consistent UI
- Visual design follows Balatro-inspired dark theme with golden accents
- All text content is in Spanish (Venezuelan variant)
- Persistence uses localStorage - no external dependencies
- No network functionality (single-player only)
- TypeScript strict mode is enabled for type safety

When making changes, ensure compatibility with the existing state management patterns and respect the game's authentic rule implementation.
