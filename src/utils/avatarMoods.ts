import { GameState } from '../types';

export type PlayResult = 'excellent' | 'good' | 'bad' | 'terrible';
export type AvatarMood = 'default' | 'happy' | 'sad' | 'smug';

// Determine play result based on game context
export const evaluatePlayResult = (
  gameState: GameState,
  isPlayerAction: boolean,
  actionType: 'card' | 'call' | 'response',
  actionSuccess?: boolean
): PlayResult => {
  // For card plays, evaluate based on card strength or round outcome
  if (actionType === 'card') {
    const playerCard = gameState.playerPlayedCard;
    const computerCard = gameState.computerPlayedCard;
    
    if (playerCard && computerCard) {
      // Both cards played, determine winner
      const playerWins = playerCard.power > computerCard.power;
      if (isPlayerAction) {
        return playerWins ? 'good' : 'bad';
      } else {
        return playerWins ? 'bad' : 'good';
      }
    }
    return 'good'; // Default for card play
  }
  
  // For calls (Truco, Envido, etc.)
  if (actionType === 'call') {
    return 'good'; // Calling shows confidence
  }
  
  // For responses to calls
  if (actionType === 'response' && actionSuccess !== undefined) {
    return actionSuccess ? 'excellent' : 'bad';
  }
  
  return 'good';
};

// Get appropriate mood based on play result
export const getMoodFromResult = (result: PlayResult, isWinning: boolean): AvatarMood => {
  const random = Math.random();
  
  switch (result) {
    case 'excellent':
      // 70% chance of happy, 30% chance of smug
      return random < 0.7 ? 'happy' : 'smug';
    
    case 'good':
      if (isWinning) {
        // 60% chance of happy, 40% chance of smug
        return random < 0.6 ? 'happy' : 'smug';
      } else {
        // 80% chance of happy, 20% chance of default
        return random < 0.8 ? 'happy' : 'default';
      }
    
    case 'bad':
      // 60% chance of sad, 40% chance of default
      return random < 0.6 ? 'sad' : 'default';
    
    case 'terrible':
      // 90% chance of sad, 10% chance of default
      return random < 0.9 ? 'sad' : 'default';
    
    default:
      return 'default';
  }
};

// Update avatar mood in game state
export const updateAvatarMood = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  isPlayerAction: boolean,
  result: PlayResult
): void => {
  const isPlayerWinning = gameState.playerScore > gameState.computerScore;
  const isComputerWinning = gameState.computerScore > gameState.playerScore;
  
  const newMood = getMoodFromResult(
    result, 
    isPlayerAction ? isPlayerWinning : isComputerWinning
  );
  
  // Clear existing timer
  if (gameState.avatarMoodTimer) {
    clearTimeout(gameState.avatarMoodTimer);
  }
  
  // Set new mood and timer (increased to 8 seconds for better visibility)
  const timerId = setTimeout(() => {
    setGameState(prevState => ({
      ...prevState,
      computerAvatarMood: 'default',
      playerAvatarMood: 'default',
      avatarMoodTimer: null
    }));
  }, 8000) as unknown as number;
  
  setGameState(prevState => ({
    ...prevState,
    ...(isPlayerAction 
      ? { playerAvatarMood: newMood }
      : { computerAvatarMood: newMood }
    ),
    avatarMoodTimer: timerId
  }));
};

// Reset avatars to default at turn start
export const resetAvatarsToDefault = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
): void => {
  if (gameState.avatarMoodTimer) {
    clearTimeout(gameState.avatarMoodTimer);
  }
  
  setGameState(prevState => ({
    ...prevState,
    computerAvatarMood: 'default',
    playerAvatarMood: 'default',
    avatarMoodTimer: null
  }));
};

// Get avatar image path based on mood with fallback support
export const getAvatarImagePath = (baseAvatar: string, mood: AvatarMood, isPlayer: boolean): string => {
  if (isPlayer) {
    // Player avatar handling - always use player- prefix
    if (mood === 'default') {
      return '/images/avatars/player-default.jpg';
    } else {
      return `/images/avatars/player-${mood}.jpg`;
    }
  } else {
    // Computer avatar handling
    const avatarName = baseAvatar.replace('.jpg', '');
    if (mood === 'default') {
      // Computer avatars also use -default suffix
      return `/images/avatars/${avatarName}-default.jpg`;
    } else {
      // Try mood-specific avatar, fallback handled by onError
      return `/images/avatars/${avatarName}-${mood}.jpg`;
    }
  }
};

// Get fallback image path when mood image fails to load
export const getFallbackAvatarPath = (baseAvatar: string, isPlayer: boolean): string => {
  if (isPlayer) {
    return '/images/avatars/player-default.jpg';
  } else {
    const avatarName = baseAvatar.replace('.jpg', '');
    return `/images/avatars/${avatarName}-default.jpg`;
  }
};

// Get smart fallback that uses avatar1 emotions if current avatar doesn't have them
export const getSmartFallbackPath = (baseAvatar: string, mood: AvatarMood, isPlayer: boolean): string => {
  if (isPlayer) {
    return '/images/avatars/player-default.jpg';
  } else {
    const avatarName = baseAvatar.replace('.jpg', '');
    // Only avatar1 has all emotions, others fallback to avatar1 for moods
    if (mood !== 'default' && avatarName !== 'avatar1') {
      return `/images/avatars/avatar1-${mood}.jpg`;
    } else {
      return `/images/avatars/${avatarName}-default.jpg`;
    }
  }
};
