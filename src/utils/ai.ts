import { Card, GameState, AIPersonality } from '../types';

export function getAICallDecision(gameState: GameState): 'accept' | 'reject' | 'raise' | null {
  const { lastCall } = gameState;
  const personality = gameState.aiPersonality;
  
  if (!lastCall) return null;
  
  // Base acceptance probability
  let acceptChance = 0.5;
  let raiseChance = 0.2;
  
  // Adjust based on call type
  if (lastCall === 'envido') {
    const aiEnvidoPoints = gameState.computerEnvidoPoints;
    if (aiEnvidoPoints >= 30) {
      acceptChance = 0.9;
      raiseChance = 0.6; // Very likely to raise with high envido
    } else if (aiEnvidoPoints >= 27) {
      acceptChance = 0.7;
      raiseChance = 0.3;
    } else if (aiEnvidoPoints >= 24) {
      acceptChance = 0.5;
      raiseChance = 0.1;
    } else {
      acceptChance = 0.3;
      raiseChance = 0.05;
    }
  } else if (lastCall === 'truco' || lastCall === 'retruco' || lastCall === 'vale4') {
    const handStrength = calculateHandStrength(gameState.computerHand);
    acceptChance = handStrength / 100;
    raiseChance = Math.max(0, (handStrength - 70) / 100);
  } else if (lastCall === 'flor') {
    if (gameState.computerHasFlor) {
      const aiEnvidoPoints = gameState.computerEnvidoPoints; // Use envido points for flor comparison
      raiseChance = aiEnvidoPoints >= 30 ? 0.8 : 0.3; // Contra Flor chance
      acceptChance = 0.9; // Almost always accept if we have flor
    } else {
      acceptChance = 0.1; // Very unlikely to accept if we don't have flor
      raiseChance = 0;
    }
  }
  
  // Personality adjustments
  acceptChance += (personality.agresividad - 5) * 0.04;
  acceptChance += (personality.calculo - 5) * 0.03;
  raiseChance += (personality.agresividad - 5) * 0.03;
  raiseChance += (personality.intimidacion - 5) * 0.02;
  
  // Score situation adjustments
  if (gameState.computerScore < gameState.playerScore) {
    acceptChance += 0.15;
    raiseChance += 0.1;
  } else if (gameState.computerScore > gameState.playerScore) {
    acceptChance -= 0.1;
    raiseChance -= 0.05;
  }
  
  // Ensure bounds
  acceptChance = Math.max(0.05, Math.min(0.95, acceptChance));
  raiseChance = Math.max(0, Math.min(0.8, raiseChance));
  
  const decision = Math.random();
  
  if (decision < raiseChance) return 'raise';
  if (decision < acceptChance) return 'accept';
  return 'reject';
}

export function getAIResponse(callType: string, gameState: GameState): boolean {
  const decision = getAICallDecision(gameState);
  return decision === 'accept' || decision === 'raise';
}

export function selectBestCardForAI(gameState: GameState): number {
  const difficulty = gameState.difficulty;
  const personality = gameState.aiPersonality;

  if (difficulty === 'easy') {
    return Math.floor(Math.random() * gameState.computerHand.length);
  } else if (difficulty === 'medium') {
    return selectMediumAICard(gameState, personality);
  } else if (difficulty === 'hard') {
    return selectAdvancedAICard(gameState, personality);
  } else if (difficulty === 'master') {
    return selectOptimalAICard(gameState, personality);
  }

  return Math.floor(Math.random() * gameState.computerHand.length);
}

function selectMediumAICard(gameState: GameState, personality: AIPersonality): number {
  const hand = gameState.computerHand;
  const playerCard = gameState.playerPlayedCard;

  if (playerCard) {
    const playerPower = playerCard.power;
    const winningCards = hand.filter(card => card.power > playerPower);

    if (winningCards.length > 0) {
      // Use agresividad to decide whether to play the best card or save it
      const agresividadFactor = personality.agresividad / 10;
      if (Math.random() < agresividadFactor) {
        // Play the best card
        const bestCard = winningCards.reduce((max, card) =>
          card.power > max.power ? card : max);
        return hand.indexOf(bestCard);
      } else {
        // Play a moderate card
        const middleCard = winningCards[Math.floor(winningCards.length / 2)];
        return hand.indexOf(middleCard);
      }
    } else {
      // No winning cards, play the worst card
      const worstCard = hand.reduce((min, card) =>
        card.power < min.power ? card : min);
      return hand.indexOf(worstCard);
    }
  }

  // Opening play - use calculo for strategic opening
  const calculoFactor = personality.calculo / 10;
  if (Math.random() < calculoFactor) {
    // Strategic opening - play middle strength card
    const sortedHand = [...hand].sort((a, b) => a.power - b.power);
    const middleCard = sortedHand[Math.floor(sortedHand.length / 2)];
    return hand.indexOf(middleCard);
  } else {
    // Random opening
    return Math.floor(Math.random() * hand.length);
  }
}

function selectAdvancedAICard(gameState: GameState, personality: AIPersonality): number {
  const hand = gameState.computerHand;
  const playerCard = gameState.playerPlayedCard;

  if (playerCard) {
    const winningCards = hand.filter(card => card.power > playerCard.power);

    if (winningCards.length > 0) {
      // Use intimidacion for bluffing - sometimes play worse cards to deceive
      const bluffChance = personality.intimidacion / 20; // 0-0.5 bluff chance
      if (Math.random() < bluffChance) {
        // Bluff: play a card that's not the best
        const bluffCard = winningCards[Math.floor(Math.random() * (winningCards.length - 1))];
        return hand.indexOf(bluffCard);
      } else {
        // Normal play: play the minimal winning card
        const bestCard = winningCards.reduce((min, card) =>
          card.power < min.power ? card : min);
        return hand.indexOf(bestCard);
      }
    } else {
      // No winning cards - use calculo to decide what to play
      const calculoFactor = personality.calculo / 10;
      if (Math.random() < calculoFactor) {
        // Strategic play: play the best available card
        const bestCard = hand.reduce((max, card) =>
          card.power > max.power ? card : max);
        return hand.indexOf(bestCard);
      } else {
        // Conservative play: play the worst card
        const worstCard = hand.reduce((min, card) =>
          card.power < min.power ? card : min);
        return hand.indexOf(worstCard);
      }
    }
  } else {
    // Opening play - use adaptabilidad for round-based strategy
    if (gameState.currentRound === 1) {
      const sortedHand = [...hand].sort((a, b) => a.power - b.power);
      const middleCard = sortedHand[Math.floor(sortedHand.length / 2)];
      return hand.indexOf(middleCard);
    } else {
      // Later rounds - use agresividad to decide aggression level
      const agresividadFactor = personality.agresividad / 10;
      if (Math.random() < agresividadFactor) {
        // Aggressive: play best card
        const bestCard = hand.reduce((max, card) =>
          card.power > max.power ? card : max);
        return hand.indexOf(bestCard);
      } else {
        // Conservative: play middle card
        const sortedHand = [...hand].sort((a, b) => a.power - b.power);
        const middleCard = sortedHand[Math.floor(sortedHand.length / 2)];
        return hand.indexOf(middleCard);
      }
    }
  }
}

function selectOptimalAICard(gameState: GameState, personality: AIPersonality): number {
  const hand = gameState.computerHand;
  const playerCard = gameState.playerPlayedCard;

  if (playerCard) {
    const canWin = hand.some(card => card.power > playerCard.power);

    if (canWin) {
      const winningCards = hand.filter(card => card.power > playerCard.power);

      // Use intimidacion for sophisticated bluffing at master level
      const bluffChance = personality.intimidacion / 15; // 0-0.67 bluff chance
      if (Math.random() < bluffChance && winningCards.length > 1) {
        // Bluff: play a card that's not the absolute best
        const bluffCard = winningCards[Math.floor(Math.random() * (winningCards.length - 1))];
        return hand.indexOf(bluffCard);
      } else {
        // Optimal play: play the minimal winning card
        const optimalCard = winningCards.reduce((min, card) =>
          card.power < min.power ? card : min);
        return hand.indexOf(optimalCard);
      }
    } else {
      // Can't win - use calculo and adaptabilidad for optimal sacrifice
      const calculoFactor = personality.calculo / 10;
      const adaptabilidadFactor = personality.adaptabilidad / 10;

      if (Math.random() < calculoFactor * adaptabilidadFactor) {
        // Strategic sacrifice: play the best available card
        const bestCard = hand.reduce((max, card) =>
          card.power > max.power ? card : max);
        return hand.indexOf(bestCard);
      } else {
        // Conservative sacrifice: play the worst card
        const worstCard = hand.reduce((min, card) =>
          card.power < min.power ? card : min);
        return hand.indexOf(worstCard);
      }
    }
  } else {
    return selectOptimalOpeningCard(gameState, personality);
  }
}

function selectOptimalOpeningCard(gameState: GameState, personality: AIPersonality): number {
  const hand = gameState.computerHand;
  const roundsWon = gameState.roundsWon;

  // Use adaptabilidad for round-based strategy
  if (roundsWon.computer === 0 && roundsWon.player === 0) {
    // First round - use calculo for strategic opening
    const calculoFactor = personality.calculo / 10;
    if (Math.random() < calculoFactor) {
      // Strategic: play second-best card to save the best
      const sortedHand = [...hand].sort((a, b) => b.power - a.power);
      return hand.indexOf(sortedHand[1] || sortedHand[0]);
    } else {
      // Aggressive: play the best card immediately
      const bestCard = hand.reduce((max, card) =>
        card.power > max.power ? card : max);
      return hand.indexOf(bestCard);
    }
  } else if (roundsWon.computer > roundsWon.player) {
    // Winning - use agresividad to press advantage
    const agresividadFactor = personality.agresividad / 10;
    if (Math.random() < agresividadFactor) {
      // Aggressive: play best card
      const bestCard = hand.reduce((max, card) =>
        card.power > max.power ? card : max);
      return hand.indexOf(bestCard);
    } else {
      // Conservative: play worst card to save good ones
      const sortedHand = [...hand].sort((a, b) => a.power - b.power);
      return hand.indexOf(sortedHand[0]);
    }
  } else {
    // Losing or tied - use adaptabilidad to recover
    const adaptabilidadFactor = personality.adaptabilidad / 10;
    if (Math.random() < adaptabilidadFactor) {
      // Adaptive: play best card to try to recover
      const bestCard = hand.reduce((max, card) =>
        card.power > max.power ? card : max);
      return hand.indexOf(bestCard);
    } else {
      // Conservative: save good cards for later
      const sortedHand = [...hand].sort((a, b) => a.power - b.power);
      return hand.indexOf(sortedHand[Math.floor(sortedHand.length / 2)]);
    }
  }
}

function calculateHandStrength(hand: Card[]): number {
  if (!hand || hand.length === 0) return 0;

  const totalPower = hand.reduce((sum, card) => sum + card.power, 0);
  const maxPossiblePower = 14 + 13 + 12;

  return Math.min(100, (totalPower / maxPossiblePower) * 100);
}