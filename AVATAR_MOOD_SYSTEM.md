# Dynamic Avatar Mood System

## Overview
The avatar mood system dynamically changes both player and AI avatars based on game results and actions, providing visual feedback that enhances the gaming experience.

## Avatar States
Each avatar has 4 possible mood states:
- **default** - neutral expression at turn start
- **happy** - positive result or good play
- **sad** - negative result or bad play  
- **smug** - confident/winning expression

## Image File Structure
The system expects these image files in `/public/images/avatars/`:

### Computer Avatars (based on selected avatar)
- `avatar1-default.jpg` - neutral expression
- `avatar1-happy.jpg` - happy expression
- `avatar1-sad.jpg` - sad expression  
- `avatar1-smug.jpg` - smug/confident expression

### Player Avatar
- `player-default.jpg` - neutral expression (or just `player.jpg`)
- `player-happy.jpg` - happy expression
- `player-sad.jpg` - sad expression
- `player-smug.jpg` - smug expression

## Mood Logic

### Play Results Classification
1. **Excellent** - Major wins, successful Truco calls, perfect plays
   - 70% chance: happy
   - 30% chance: smug

2. **Good** - Standard good plays, winning cards
   - If winning game: 60% happy, 40% smug
   - If losing game: 80% happy, 20% default

3. **Bad** - Losing plays, rejected calls
   - 60% chance: sad
   - 40% chance: default

4. **Terrible** - Major losses, losing entire game
   - 90% chance: sad
   - 10% chance: default

### Mood Triggers

#### Card Play Results
- **Winning a round**: Good result for winner, bad for loser
- **Losing a round**: Bad result for loser, good for winner

#### Call Actions (Truco, Envido, etc.)
- **Making a call**: Good result (shows confidence)
- **Accepting a call**: Excellent result 
- **Rejecting a call**: Bad result
- **Folding hand**: Bad result

#### Game End
- **Winning game**: Excellent result for winner, terrible for loser
- **Losing game**: Terrible result for loser, excellent for winner

## Timing System
- **Turn Start**: Both avatars reset to default
- **After Action**: Mood changes immediately based on result
- **Auto Reset**: Returns to default after 5 seconds (unless new action occurs)
- **Cleanup**: Previous timers are cleared when new moods are set

## Implementation Details

### Key Files
1. **`/src/utils/avatarMoods.ts`** - Core mood system logic
2. **`/src/types/index.ts`** - Extended GameState with mood properties
3. **`/src/components/GameBoard.tsx`** - Dynamic avatar rendering
4. **`/src/utils/gameLogic.ts`** - Game state initialization
5. **`/src/App.tsx`** - Action integration

### GameState Extensions
```typescript
interface GameState {
  // ... existing properties
  computerAvatarMood: 'default' | 'happy' | 'sad' | 'smug';
  playerAvatarMood: 'default' | 'happy' | 'sad' | 'smug'; 
  avatarMoodTimer: number | null;
}
```

### Core Functions

#### `evaluatePlayResult(gameState, isPlayerAction, actionType, actionSuccess?)`
- Analyzes game context to determine play result quality
- Returns: 'excellent' | 'good' | 'bad' | 'terrible'

#### `updateAvatarMood(gameState, setGameState, isPlayerAction, result)`
- Updates avatar mood based on play result
- Sets 5-second timer to return to default
- Clears existing timers

#### `getAvatarImagePath(baseAvatar, mood, isPlayer)`
- Generates correct image path based on mood
- Handles player vs computer avatar naming

#### `resetAvatarsToDefault(gameState, setGameState)`
- Resets both avatars to default state
- Called at turn start and round transitions

### Integration Points
- **Card Play**: Moods change based on round winner
- **Call Actions**: Immediate mood response to calls/responses
- **Turn Changes**: Auto-reset to default
- **Game End**: Final mood based on game winner

## Usage Example
```typescript
// After a player wins a round
const result = evaluatePlayResult(gameState, true, 'card');
updateAvatarMood(gameState, setGameState, true, result);

// AI mood will be set automatically based on opposite result
setTimeout(() => {
  const aiResult = evaluatePlayResult(gameState, false, 'card');
  updateAvatarMood(gameState, setGameState, false, aiResult);
}, 500);
```

## Testing
To test the system:
1. Start a new game
2. Play cards and make calls
3. Observe avatar changes after each action
4. Verify 5-second auto-reset to default
5. Check game end animations

## Image Requirements
- All avatar images should be same dimensions (224x224px recommended)
- JPG format preferred for consistency  
- Clear facial expressions that match mood states
- Professional game art style consistent with existing avatars

## Future Enhancements
- Additional mood states (angry, surprised, etc.)
- Mood intensity levels
- Personality-based mood tendencies
- Custom player avatar selection
- Animated transitions between moods
