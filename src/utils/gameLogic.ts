import { Card, GameState, GameSettings, PlayerStats } from '../types';
import { shuffleDeck, calculateEnvidoPoints, hasFlor, calculateHandStrength, getPericoCard, getCardTrucoRank } from './cards';
import { getAIResponse, selectBestCardForAI } from './ai';
import { playSound } from './sound';
import { generateRandomPersonality, getRandomArchetypeName } from './personality';

// Cap lore/event log to avoid unbounded growth
const capLore = (events: string[], max: number = 50) => (events.length > max ? events.slice(events.length - max) : events);

export function addLore(state: GameState, msg: string): GameState {
  return { ...state, activeCalls: capLore([...(state.activeCalls || []), msg]) };
}

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
    trucoAcceptedPot: 1,
    trucoPendingOffer: null,
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
    manoIsPlayer: true,
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

  // Toggle Mano/Pie (player starts first hand as Mano by default)
  const nextMano = typeof gameState.manoIsPlayer === 'boolean' ? !gameState.manoIsPlayer : true;

  const playerFlor = hasFlor(playerHand, viraCard);
  const computerFlor = hasFlor(computerHand, viraCard);

  return {
    ...gameState,
    currentRound: 1,
    roundsWon: { player: 0, computer: 0 },
    activeCalls: capLore([...gameState.activeCalls, '— Nueva mano —']),
    isPlayerTurn: true,
    currentTrucoLevel: 0,
    trucoAcceptedPot: 1,
    trucoPendingOffer: null,
    currentEnvidoLevel: 0,
    playerEnvidoPoints: calculateEnvidoPoints(playerHand, viraCard),
    computerEnvidoPoints: calculateEnvidoPoints(computerHand, viraCard),
    playerHasFlor: playerFlor,
    computerHasFlor: computerFlor,
    waitingForResponse: false,
    isProcessingAction: false,
    lastCall: null,
    playerHand,
    computerHand,
    playerPlayedCard: null,
    computerPlayedCard: null,
    viraCard,
    pericoCard,
    manoIsPlayer: nextMano,
    currentPhase: (playerFlor || computerFlor) ? 'flor' as const : 'envido' as const
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

  const vira = gameState.viraCard!;
  const playerPower = getCardTrucoRank(gameState.playerPlayedCard, vira);
  const computerPower = getCardTrucoRank(gameState.computerPlayedCard, vira);

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

  // Build lore explanation for the round
  const pp = gameState.playerPlayedCard;
  const cp = gameState.computerPlayedCard;
  let explanation = '';
  if (pp && cp) {
    if (roundWinner === 'player') explanation = `Resultado: Gana Jugador (${pp.name} vence a ${cp.name})`;
    else if (roundWinner === 'computer') explanation = `Resultado: Gana Computadora (${cp.name} vence a ${pp.name})`;
    else explanation = `Resultado: Empate (${pp.name} vs ${cp.name})`;
  }

  const updatedState = explanation
    ? addLore({ ...gameState, roundsWon: newRoundsWon }, explanation)
    : { ...gameState, roundsWon: newRoundsWon };

  return {
    winner: roundWinner,
    gameState: updatedState
  };
}

export function endHand(gameState: GameState, winner: 'player' | 'computer' | 'tie', settings: GameSettings): { gameState: GameState, pointsAdded: number } {
  let pointsToAdd = 1; // Mano simple vale 1 punto si no hubo Truco aceptado

  if (gameState.trucoAcceptedPot === 'game') {
    // Vale Juego querido: gana el partido
    const newState = { ...gameState };
    if (winner === 'player') newState.playerScore = 24;
    else if (winner === 'computer') newState.computerScore = 24;
    return { gameState: newState, pointsAdded: 24 };
  }

  if (typeof gameState.trucoAcceptedPot === 'number' && gameState.trucoAcceptedPot > 1) {
    pointsToAdd = gameState.trucoAcceptedPot;
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
activeCalls: capLore([...gameState.activeCalls, 'Canto: Truco']),
    trucoPendingOffer: 3,
    lastCall: 'truco',
    waitingForResponse: true
  };
}

export function callRetruco(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.isPlayerTurn || gameState.waitingForResponse) return gameState;

  playSound('call', settings);

  return {
    ...gameState,
activeCalls: capLore([...gameState.activeCalls, 'Canto: Retruco']),
    trucoPendingOffer: 6,
    lastCall: 'retruco',
    waitingForResponse: true
  };
}


export function callValeNueve(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.isPlayerTurn || gameState.waitingForResponse) return gameState;

  playSound('call', settings);

  return {
    ...gameState,
activeCalls: capLore([...gameState.activeCalls, 'Canto: Vale Nueve']),
    trucoPendingOffer: 9,
    lastCall: 'valeNueve',
    waitingForResponse: true
  };
}

export function callValeJuego(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.isPlayerTurn || gameState.waitingForResponse) return gameState;

  playSound('call', settings);

  return {
    ...gameState,
activeCalls: capLore([...gameState.activeCalls, 'Canto: Vale Juego']),
    trucoPendingOffer: 'game',
    lastCall: 'valeJuego',
    waitingForResponse: true
  };
}

export function callEnvido(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.isPlayerTurn || gameState.waitingForResponse) return gameState;

  playSound('call', settings);

  return {
    ...gameState,
activeCalls: capLore([...gameState.activeCalls, 'Canto: Envido']),
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
activeCalls: capLore([...gameState.activeCalls, 'Canto: +2 piedras']),
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
activeCalls: capLore([...gameState.activeCalls, 'Canto: Falta Envido']),
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

  // Truco family
  if (gameState.lastCall === 'truco' || gameState.lastCall === 'retruco' || gameState.lastCall === 'valeNueve' || gameState.lastCall === 'valeJuego') {
    let level = gameState.currentTrucoLevel;
    if (gameState.lastCall === 'truco') level = 1;
    else if (gameState.lastCall === 'retruco') level = 2;
    else if (gameState.lastCall === 'valeNueve') level = 3;
    else if (gameState.lastCall === 'valeJuego') level = 4;

    const offer = gameState.trucoPendingOffer || 1;
    const label = gameState.lastCall === 'truco' ? 'Truco' : gameState.lastCall === 'retruco' ? 'Retruco' : gameState.lastCall === 'valeNueve' ? 'Vale Nueve' : 'Vale Juego';

    return {
      ...gameState,
      waitingForResponse: false,
      currentTrucoLevel: level,
      trucoAcceptedPot: offer,
      trucoPendingOffer: null,
activeCalls: capLore([...gameState.activeCalls, `Quiero: ${label} aceptado (pote=${offer === 'game' ? 'juego' : offer})`])
    };
  }

  // Para flor
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

  // Puntos por rechazar cantos de Truco (Venezolano)
  if (gameState.lastCall === 'truco' || gameState.lastCall === 'retruco' || gameState.lastCall === 'valeNueve' || gameState.lastCall === 'valeJuego') {
    // Award previous accepted pot (or 1 if none). Vale Juego no querido vale 9
    const prev = gameState.trucoAcceptedPot === 'game' ? 9 : (gameState.trucoAcceptedPot || 1);
    pointsToAdd = prev;
  }
  // Puntos por rechazar cantos de Envido
  else if (gameState.lastCall === 'envido') {
    pointsToAdd = 1; // Rechazar Envido = 1 punto al cantante
    nextPhase = 'truco'; // Avanzar a fase de truco después de rechazar Envido
  } else if (gameState.lastCall === 'realEnvido') {
    pointsToAdd = 1; // Rechazar +2 piedras = 1 punto al cantante
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

  const labelMap: Record<string, string> = { truco: 'Truco', retruco: 'Retruco', valeNueve: 'Vale Nueve', valeJuego: 'Vale Juego', envido: 'Envido', realEnvido: '+2 piedras', faltaEnvido: 'Falta Envido', flor: 'Flor' };
  const label = gameState.lastCall ? (labelMap[gameState.lastCall] || gameState.lastCall) : '';
  const rejectMsg = (gameState.lastCall === 'truco' || gameState.lastCall === 'retruco' || gameState.lastCall === 'valeNueve' || gameState.lastCall === 'valeJuego')
    ? `No Quiero: ${label} (gana ${pointsToAdd} al cantante)`
    : (gameState.lastCall === 'envido' || gameState.lastCall === 'realEnvido' || gameState.lastCall === 'faltaEnvido')
      ? `No Quiero: ${label} (gana 1 al cantante)`
      : `No Quiero: ${label}`;

  return {
    ...gameState,
    playerScore: gameState.playerScore + pointsToAdd,
    waitingForResponse: false,
    currentTrucoLevel: 0,
    currentEnvidoLevel: 0,
    trucoPendingOffer: null,
    currentPhase: nextPhase,
    lastCall: null, // Limpiar el último canto
activeCalls: capLore([...gameState.activeCalls, rejectMsg])
  };
}

export function resolveEnvido(gameState: GameState, settings: GameSettings): GameState {
  const playerPoints = gameState.playerEnvidoPoints;
  const computerPoints = gameState.computerEnvidoPoints;

  // Puntos según cantos de Envido (Venezolano):
  let pointsToAdd = 2; // Envido simple = 2 puntos
  if (gameState.currentEnvidoLevel === 2) pointsToAdd = 4; // +2 piedras = 4 puntos total
  if (gameState.currentEnvidoLevel === 3) {
    // Falta Envido = puntos que faltan para llegar a 24 al que va adelante
    const leaderScore = Math.max(gameState.playerScore, gameState.computerScore);
    pointsToAdd = Math.max(1, 24 - leaderScore);
  }

  let newGameState = { ...gameState };

  let winnerStr = '';
  if (playerPoints > computerPoints) {
    newGameState.playerScore += pointsToAdd;
    playSound('envidoWin', settings);
    winnerStr = 'Jugador';
  } else if (computerPoints > playerPoints) {
    newGameState.computerScore += pointsToAdd;
    playSound('envidoLose', settings);
    winnerStr = 'Computadora';
  } else {
    // Empate: gana el Más Mano
    if (newGameState.manoIsPlayer) {
      newGameState.playerScore += pointsToAdd;
      winnerStr = 'Jugador (Más Mano)';
    } else {
      newGameState.computerScore += pointsToAdd;
      winnerStr = 'Computadora (Más Mano)';
    }
    playSound('envidoWin', settings);
  }

  const levelLabel = newGameState.currentEnvidoLevel === 1 ? 'Envido' : newGameState.currentEnvidoLevel === 2 ? '+2 piedras' : 'Falta Envido';
  const msg = `Envido querido: ${winnerStr} +${pointsToAdd} (${levelLabel}). Cartas: ${playerPoints} vs ${computerPoints}`;

  return {
    ...newGameState,
    currentEnvidoLevel: 0,
    waitingForResponse: false,
    currentPhase: 'truco' as const, // Advance to Truco phase after Envido resolution
activeCalls: capLore([...newGameState.activeCalls, msg])
  };
}

export function callFlor(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.playerHasFlor || gameState.currentPhase !== 'flor') return gameState;

  playSound('florWin', settings);

  // Computar Flor Reservada simple
  const isFlorReservada = gameState.playerHasFlorReservada === true;
  const pointsToAdd = 3; // Flor vale 3 puntos (Reservada mantiene efectos especiales en reglas avanzadas)

  // Si la computadora también tiene Flor, se espera manejo de Envite de Flores (fase 2)
  if (gameState.computerHasFlor) {
    return {
      ...gameState,
activeCalls: capLore([...gameState.activeCalls, 'Canto: Flor']),
      lastCall: 'flor',
      waitingForResponse: true
    };
  }

  // Flor simple: cobrar 3 y pasar a Envido
  return {
    ...gameState,
activeCalls: capLore([...gameState.activeCalls, isFlorReservada ? 'Canto: Flor Reservada' : 'Canto: Flor', `Flor cobrada: +${pointsToAdd}`]),
    playerScore: gameState.playerScore + pointsToAdd,
    currentPhase: 'envido' as const
  };
}

export function foldHand(gameState: GameState, settings: GameSettings): GameState {
  if (!gameState.isPlayerTurn || gameState.waitingForResponse) return gameState;

  playSound('fold', settings);

  // Irse al mazo: 2 tantos al contrario (1 Envite + 1 Truco)
  return {
    ...gameState,
    computerScore: gameState.computerScore + 2,
    activeCalls: capLore([...gameState.activeCalls, 'Me voy al mazo: +2 para Computadora']),
    isProcessingAction: true
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

export function applyRoundResult(currentState: GameState, roundWinner: 'player' | 'computer' | 'tie', settings: GameSettings): { state: GameState, handEnded: boolean, gameEnded: boolean } {
  // If tie, proceed to next round
  let newState = { ...currentState };
  const newRoundsWon = { ...currentState.roundsWon };

  if (roundWinner === 'player') newRoundsWon.player++;
  else if (roundWinner === 'computer') newRoundsWon.computer++;

  let handWinner: 'player' | 'computer' | 'tie' = 'tie';

  if (newRoundsWon.player >= 2) handWinner = 'player';
  else if (newRoundsWon.computer >= 2) handWinner = 'computer';
  else if (currentState.currentRound >= currentState.maxRounds) {
    if (newRoundsWon.player > newRoundsWon.computer) handWinner = 'player';
    else if (newRoundsWon.computer > newRoundsWon.player) handWinner = 'computer';
  }

  if (handWinner !== 'tie') {
    const { gameState: endState, pointsAdded } = endHand(currentState, handWinner, settings);
    const finalState = { ...endState, roundsWon: newRoundsWon };
    const summary = `— Fin de mano — Ganador: ${handWinner === 'player' ? 'Jugador' : 'Computadora'} | Puntos: +${pointsAdded} | Marcador: Jugador ${finalState.playerScore} - ${finalState.computerScore} Computadora`;
    const withLore = addLore(finalState, summary);

    const gameEnd = checkGameEnd(withLore);
    return { state: withLore, handEnded: true, gameEnded: gameEnd !== null };
  } else {
    // Continue to next round
    newState = {
      ...currentState,
      currentRound: currentState.currentRound + 1,
      isPlayerTurn: true,
      roundsWon: newRoundsWon,
      playerPlayedCard: null,
      computerPlayedCard: null,
      waitingForResponse: false,
      isProcessingAction: false
    };
    return { state: newState, handEnded: false, gameEnded: false };
  }
}

export function getAiDelay(settings: GameSettings): number {
  const baseDelay = 1000;
  const speedMultiplier = settings.gameSpeed / 3;
  const responseTime = settings.aiResponseTime * 100;
  // Aumentar pausas en +2s
  return Math.max(500, baseDelay + responseTime - (speedMultiplier * 300) + 2000);
}
