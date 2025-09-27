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

export function initializeGameState(difficulty: string, selectedAvatar: string): GameState {
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
    difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'master',
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
    viraCard: null,
    pericoCard: null,
    // Avatar mood system
    computerAvatarMood: 'default' as const,
    playerAvatarMood: 'default' as const,
    avatarMoodTimer: null,
    // Action protection
    isProcessingAction: false
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
    pericoCard
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
  let pointsToAdd = 1;

  if (gameState.currentTrucoLevel > 0) {
    pointsToAdd = gameState.currentTrucoLevel + 1;
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
  if (!gameState.isPlayerTurn || gameState.currentEnvidoLevel <= 2 || gameState.waitingForResponse) return gameState;

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

  return {
    ...gameState,
    waitingForResponse: false
  };
}

export function rejectCall(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.waitingForResponse) return gameState;

  playSound('reject', settings);

  let pointsToAdd = 1;
  if (gameState.currentTrucoLevel > 0) {
    pointsToAdd = gameState.currentTrucoLevel;
  }

  return {
    ...gameState,
    playerScore: gameState.playerScore + pointsToAdd,
    waitingForResponse: false
  };
}

export function resolveEnvido(gameState: GameState, settings: GameSettings): GameState {
  const playerPoints = gameState.playerEnvidoPoints;
  const computerPoints = gameState.computerEnvidoPoints;

  let pointsToAdd = 2;
  if (gameState.currentEnvidoLevel === 2) pointsToAdd = 3;
  if (gameState.currentEnvidoLevel === 3) pointsToAdd = Math.max(1, 30 - Math.max(gameState.playerScore, gameState.computerScore));

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
    waitingForResponse: false
  };
}

export function callFlor(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.isPlayerTurn || !gameState.playerHasFlor) return gameState;

  playSound('florWin', settings);

  // Check if this is Flor Reservada (called after some rounds have been played)
  const isFlorReservada = gameState.currentRound > 1;

  return {
    ...gameState,
    activeCalls: [...gameState.activeCalls, isFlorReservada ? 'Flor Reservada' : 'Flor'],
    playerScore: gameState.playerScore + (isFlorReservada ? 6 : 3) // Flor Reservada gives 6 points
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

export function getAiDelay(settings: GameSettings): number {
  const baseDelay = 1000;
  const speedMultiplier = settings.gameSpeed / 3;
  const responseTime = settings.aiResponseTime * 100;
  return Math.max(500, baseDelay + responseTime - (speedMultiplier * 300));
}