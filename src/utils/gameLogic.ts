import { Card, GameState, GameSettings, PlayerStats } from '../types';
import { shuffleDeck, calculateEnvidoPoints, hasFlor, calculateHandStrength, getPericoCard } from './cards';
import { getAIResponse, selectBestCardForAI } from './ai';
import { playSound } from './sound';
import { generateRandomPersonality, getRandomArchetypeName } from './personality';

export function dealCards(): { playerHand: Card[], computerHand: Card[], viraCard: Card } {
  const shuffledCards = shuffleDeck();

  const playerHand = shuffledCards.slice(0, 3);
  const computerHand = shuffledCards.slice(3, 6);
  const viraCard = shuffledCards[6]; // Bottom card becomes the vira

  return { playerHand, computerHand, viraCard };
}

export function initializeGameState(difficulty: string, selectedAvatar: string, selectedOpponent: any = null): GameState {
  // Generate a random personality for each new game
  const randomArchetype = getRandomArchetypeName();
  const aiPersonality = generateRandomPersonality();

  return {
    playerScore: 0,
    computerScore: 0,
    currentRound: 1,
    maxRounds: 3,
    playerHand: [],
    computerHand: [],
    playerPlayedCard: null,
    computerPlayedCard: null,
    isPlayerTurn: true,
    difficulty: difficulty as 'easy' | 'medium' | 'intermediate' | 'hard' | 'master',
    aiPersonality,
    activeCalls: [],
    roundsWon: { player: 0, computer: 0 },
    gameInProgress: true,
    handInProgress: false,
    currentTrucoLevel: 0,
    currentEnvidoLevel: 0,
    playerEnvidoPoints: 0,
    computerEnvidoPoints: 0,
    playerHasFlor: false,
    computerHasFlor: false,
    waitingForResponse: false,
    lastCall: null,
    gameStartTime: Date.now(),
    currentStreak: 0,
    bestStreak: 0,
    selectedAvatar,
    selectedOpponent,
    viraCard: null,
    pericoCard: null,
    // Avatar mood system
    computerAvatarMood: 'default' as const,
    playerAvatarMood: 'default' as const,
    avatarMoodTimer: null,
    // Action protection
    isProcessingAction: false,
    // Game phases
    currentPhase: 'flor' as const
  };
}

export function startNewHand(gameState: GameState): GameState {
  const { playerHand, computerHand, viraCard } = dealCards();
  const pericoCard = getPericoCard(viraCard);

  return {
    ...gameState,
    currentRound: 1,
    roundsWon: { player: 0, computer: 0 },
    activeCalls: [],
    isPlayerTurn: true,
    currentTrucoLevel: 0,
    currentEnvidoLevel: 0,
    playerEnvidoPoints: calculateEnvidoPoints(playerHand),
    computerEnvidoPoints: calculateEnvidoPoints(computerHand),
    playerHasFlor: hasFlor(playerHand),
    computerHasFlor: hasFlor(computerHand),
    waitingForResponse: false,
    lastCall: null,
    playerHand,
    computerHand,
    playerPlayedCard: null,
    computerPlayedCard: null,
    viraCard,
    pericoCard,
    currentPhase: (hasFlor(playerHand) || hasFlor(computerHand)) ? 'flor' as const : 'envido' as const
  };
}

export function playCard(gameState: GameState, cardIndex: number, settings: GameSettings): GameState {
  if (!gameState.isPlayerTurn || !gameState.gameInProgress || gameState.waitingForResponse) {
    return gameState;
  }

  const playedCard = gameState.playerHand[cardIndex];
  const newPlayerHand = [...gameState.playerHand];
  newPlayerHand.splice(cardIndex, 1);

  playSound('playCard', settings);

  return {
    ...gameState,
    playerPlayedCard: playedCard,
    playerHand: newPlayerHand,
    isPlayerTurn: false
  };
}

export function computerPlayCard(gameState: GameState, settings: GameSettings): GameState {
  if (gameState.computerHand.length === 0) return gameState;

  const cardIndex = selectBestCardForAI(gameState);
  const playedCard = gameState.computerHand[cardIndex];
  const newComputerHand = [...gameState.computerHand];
  newComputerHand.splice(cardIndex, 1);

  playSound('playCard', settings);

  return {
    ...gameState,
    computerPlayedCard: playedCard,
    computerHand: newComputerHand
  };
}

export function evaluateRound(gameState: GameState, settings: GameSettings): { winner: 'player' | 'computer' | 'tie', gameState: GameState } {
  if (!gameState.playerPlayedCard || !gameState.computerPlayedCard) {
    return { winner: 'tie', gameState };
  }

  const playerPower = gameState.playerPlayedCard.power;
  const computerPower = gameState.computerPlayedCard.power;

  let roundWinner: 'player' | 'computer' | 'tie';

  if (playerPower > computerPower) {
    roundWinner = 'player';
    playSound('roundWin', settings);
  } else if (computerPower > playerPower) {
    roundWinner = 'computer';
    playSound('roundLose', settings);
  } else {
    roundWinner = 'tie';
    playSound('roundTie', settings);
  }

  const newRoundsWon = { ...gameState.roundsWon };
  if (roundWinner === 'player') newRoundsWon.player++;
  else if (roundWinner === 'computer') newRoundsWon.computer++;

  return {
    winner: roundWinner,
    gameState: {
      ...gameState,
      roundsWon: newRoundsWon
    }
  };
}

export function endHand(gameState: GameState, winner: 'player' | 'computer' | 'tie', settings: GameSettings): { gameState: GameState, pointsAdded: number } {
  let pointsToAdd = 1; // Mano simple vale 1 punto

  // Puntos según nivel de Truco:
  // Truco = 2 puntos, Retruco = 3 puntos, Vale 4 = 4 puntos
  if (gameState.currentTrucoLevel === 1) {
    pointsToAdd = 2; // Truco
  } else if (gameState.currentTrucoLevel === 2) {
    pointsToAdd = 3; // Retruco
  } else if (gameState.currentTrucoLevel === 3) {
    pointsToAdd = 4; // Vale 4
  }

  let newGameState = { ...gameState };

  if (winner === 'player') {
    newGameState.playerScore += pointsToAdd;
  } else if (winner === 'computer') {
    newGameState.computerScore += pointsToAdd;
  }

  return { gameState: newGameState, pointsAdded: pointsToAdd };
}

export function checkGameEnd(gameState: GameState): 'player' | 'computer' | null {
  if (gameState.playerScore >= 24) return 'player';
  if (gameState.computerScore >= 24) return 'computer';
  return null;
}

export function callEstarCantando(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.isPlayerTurn || gameState.playerScore !== 23 || gameState.waitingForResponse) return gameState;

  playSound('call', settings);

  return {
    ...gameState,
    activeCalls: [...gameState.activeCalls, 'Estar Cantando'],
    playerScore: 24, // Player wins immediately with 24 points
    gameInProgress: false
  };
}

export function callTruco(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.isPlayerTurn || gameState.waitingForResponse) return gameState;

  playSound('call', settings);

  return {
    ...gameState,
    activeCalls: [...gameState.activeCalls, 'Truco'],
    currentTrucoLevel: 1,
    lastCall: 'truco',
    waitingForResponse: true
  };
}

export function callRetruco(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.isPlayerTurn || gameState.waitingForResponse) return gameState;

  playSound('call', settings);

  return {
    ...gameState,
    activeCalls: [...gameState.activeCalls, 'Retruco'],
    currentTrucoLevel: 2,
    lastCall: 'retruco',
    waitingForResponse: true
  };
}

export function callVale4(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.isPlayerTurn || gameState.waitingForResponse) return gameState;

  playSound('call', settings);

  return {
    ...gameState,
    activeCalls: [...gameState.activeCalls, 'Vale 4'],
    currentTrucoLevel: 3,
    lastCall: 'vale4',
    waitingForResponse: true
  };
}

export function callValeNueve(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.isPlayerTurn || gameState.waitingForResponse) return gameState;

  playSound('call', settings);

  return {
    ...gameState,
    activeCalls: [...gameState.activeCalls, 'Vale Nueve'],
    lastCall: 'valeNueve',
    waitingForResponse: true
  };
}

export function callValeJuego(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.isPlayerTurn || gameState.waitingForResponse) return gameState;

  playSound('call', settings);

  return {
    ...gameState,
    activeCalls: [...gameState.activeCalls, 'Vale Juego'],
    lastCall: 'valeJuego',
    waitingForResponse: true
  };
}

export function callEnvido(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.isPlayerTurn || gameState.waitingForResponse) return gameState;

  playSound('call', settings);

  return {
    ...gameState,
    activeCalls: [...gameState.activeCalls, 'Envido'],
    currentEnvidoLevel: 1,
    lastCall: 'envido',
    waitingForResponse: true
  };
}

export function callRealEnvido(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.isPlayerTurn || gameState.currentEnvidoLevel !== 1 || gameState.waitingForResponse) return gameState;

  playSound('call', settings);

  return {
    ...gameState,
    activeCalls: [...gameState.activeCalls, 'Real Envido'],
    currentEnvidoLevel: 2,
    lastCall: 'realEnvido',
    waitingForResponse: true
  };
}

export function callFaltaEnvido(gameState: GameState, settings: GameSettings): GameState {
  // Falta Envido puede ser cantado como respuesta a cualquier canto de Envido (niveles 1-3)
  if (!gameState.isPlayerTurn || (gameState.currentEnvidoLevel === 0 || gameState.currentEnvidoLevel > 3) || gameState.waitingForResponse) return gameState;

  playSound('call', settings);

  return {
    ...gameState,
    activeCalls: [...gameState.activeCalls, 'Falta Envido'],
    currentEnvidoLevel: 3,
    lastCall: 'faltaEnvido',
    waitingForResponse: true
  };
}

export function acceptCall(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.waitingForResponse) return gameState;

  playSound('accept', settings);

  // Si se acepta un canto de Envido, resolver inmediatamente
  if (gameState.lastCall === 'envido' || gameState.lastCall === 'realEnvido' || gameState.lastCall === 'faltaEnvido') {
    return resolveEnvido(gameState, settings);
  }

  // Para otros cantos (Truco, Flor, etc.)
  return {
    ...gameState,
    waitingForResponse: false,
    currentPhase: gameState.lastCall === 'flor' ? 'envido' : gameState.currentPhase
  };
}

export function rejectCall(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.waitingForResponse) return gameState;

  playSound('reject', settings);

  let pointsToAdd = 1; // Por defecto 1 punto al que canta
  let nextPhase = gameState.currentPhase;
  
  // Puntos por rechazar cantos de Truco
  if (gameState.lastCall === 'truco') {
    pointsToAdd = 1; // Rechazar Truco = 1 punto al cantante
  } else if (gameState.lastCall === 'retruco') {
    pointsToAdd = 2; // Rechazar Retruco = 2 puntos al cantante
  } else if (gameState.lastCall === 'vale4') {
    pointsToAdd = 3; // Rechazar Vale 4 = 3 puntos al cantante
  }
  // Puntos por rechazar cantos de Envido
  else if (gameState.lastCall === 'envido') {
    pointsToAdd = 1; // Rechazar Envido = 1 punto al cantante
    nextPhase = 'truco'; // Avanzar a fase de truco después de rechazar Envido
  } else if (gameState.lastCall === 'realEnvido') {
    pointsToAdd = 1; // Rechazar Real Envido = 1 punto al cantante
    nextPhase = 'truco';
  } else if (gameState.lastCall === 'faltaEnvido') {
    pointsToAdd = 1; // Rechazar Falta Envido = 1 punto al cantante
    nextPhase = 'truco';
  }
  // Puntos por rechazar Flor
  else if (gameState.lastCall === 'flor') {
    pointsToAdd = 3; // Rechazar Flor = 3 puntos al cantante
    nextPhase = 'envido'; // Avanzar a fase de Envido después de rechazar Flor
  }

  return {
    ...gameState,
    playerScore: gameState.playerScore + pointsToAdd,
    waitingForResponse: false,
    currentTrucoLevel: 0,
    currentEnvidoLevel: 0,
    currentPhase: nextPhase,
    lastCall: null // Limpiar el último canto
  };
}

export function resolveEnvido(gameState: GameState, settings: GameSettings): GameState {
  const playerPoints = gameState.playerEnvidoPoints;
  const computerPoints = gameState.computerEnvidoPoints;

  // Puntos según cantos de Envido:
  let pointsToAdd = 2; // Envido simple = 2 puntos
  if (gameState.currentEnvidoLevel === 2) pointsToAdd = 3; // Real Envido = 3 puntos
  if (gameState.currentEnvidoLevel === 3) {
    // Falta Envido = puntos que faltan para llegar a 30
    const maxScore = Math.max(gameState.playerScore, gameState.computerScore);
    pointsToAdd = Math.max(1, 30 - maxScore);
  }

  let newGameState = { ...gameState };

  if (playerPoints > computerPoints) {
    newGameState.playerScore += pointsToAdd;
    playSound('envidoWin', settings);
  } else if (computerPoints > playerPoints) {
    newGameState.computerScore += pointsToAdd;
    playSound('envidoLose', settings);
  } else {
    newGameState.playerScore += pointsToAdd;
    playSound('envidoWin', settings);
  }

  return {
    ...newGameState,
    currentEnvidoLevel: 0,
    waitingForResponse: false,
    currentPhase: 'truco' as const // Advance to Truco phase after Envido resolution
  };
}

export function callFlor(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.playerHasFlor || gameState.currentPhase !== 'flor') return gameState;

  playSound('florWin', settings);

  // Check if this is Flor Reservada (called after some rounds have been played)
  const isFlorReservada = gameState.currentRound > 1;
  const pointsToAdd = isFlorReservada ? 6 : 3; // Flor Reservada gives 6 points

  // If computer also has flor, need to handle Contra Flor
  if (gameState.computerHasFlor) {
    return {
      ...gameState,
      activeCalls: [...gameState.activeCalls, 'Flor'],
      lastCall: 'flor',
      waitingForResponse: true // Wait for computer's response (Contra Flor or accept)
    };
  }

  // Simple Flor, advance to next phase
  return {
    ...gameState,
    activeCalls: [...gameState.activeCalls, isFlorReservada ? 'Flor Reservada' : 'Flor'],
    playerScore: gameState.playerScore + pointsToAdd,
    currentPhase: 'envido' as const
  };
}

export function foldHand(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.isPlayerTurn || gameState.waitingForResponse) return gameState;

  playSound('fold', settings);

  return {
    ...gameState,
    computerScore: gameState.computerScore + 1
  };
}

export function advancePhase(gameState: GameState): GameState {
  let nextPhase: 'flor' | 'envido' | 'truco' | 'playing';
  
  switch (gameState.currentPhase) {
    case 'flor':
      nextPhase = 'envido';
      break;
    case 'envido':
      nextPhase = 'truco';
      break;
    case 'truco':
      nextPhase = 'playing';
      break;
    default:
      nextPhase = 'playing';
  }
  
  return {
    ...gameState,
    currentPhase: nextPhase
  };
}

export function getAiDelay(settings: GameSettings): number {
  const baseDelay = 1000;
  const speedMultiplier = settings.gameSpeed / 3;
  const responseTime = settings.aiResponseTime * 100;
  return Math.max(500, baseDelay + responseTime - (speedMultiplier * 300));
}
