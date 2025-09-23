import { Card, GameState } from '../types';

export function getAIResponse(callType: string, gameState: GameState): boolean {
  const difficulty = gameState.difficulty;
  const aiPersonality = gameState.aiPersonality || 'balanced';

  let acceptChance = 0.5;

  if (difficulty === 'easy') acceptChance = 0.7;
  else if (difficulty === 'medium') acceptChance = 0.5;
  else if (difficulty === 'hard') acceptChance = 0.3;
  else if (difficulty === 'master') acceptChance = 0.2;

  if (aiPersonality === 'aggressive') acceptChance += 0.2;
  else if (aiPersonality === 'conservative') acceptChance -= 0.2;
  else if (aiPersonality === 'unpredictable') acceptChance = Math.random();

  if (gameState.computerScore > gameState.playerScore) acceptChance -= 0.1;
  else if (gameState.computerScore < gameState.playerScore) acceptChance += 0.1;

  const handStrength = calculateHandStrength(gameState.computerHand);
  acceptChance += (handStrength - 50) / 100;

  return Math.random() < acceptChance;
}

export function selectBestCardForAI(gameState: GameState): number {
  const difficulty = gameState.difficulty;
  const hand = gameState.computerHand;

  if (difficulty === 'easy') {
    return Math.floor(Math.random() * hand.length);
  } else if (difficulty === 'medium') {
    if (gameState.playerPlayedCard) {
      const playerPower = gameState.playerPlayedCard.power;
      for (let i = 0; i < hand.length; i++) {
        if (hand[i].power > playerPower) {
          return i;
        }
      }
      return hand.reduce((minIndex, card, index) =>
        card.power < hand[minIndex].power ? index : minIndex, 0);
    }
    return Math.floor(Math.random() * hand.length);
  } else if (difficulty === 'hard') {
    return selectAdvancedAICard(gameState);
  } else if (difficulty === 'master') {
    return selectOptimalAICard(gameState);
  }

  return Math.floor(Math.random() * hand.length);
}

function selectAdvancedAICard(gameState: GameState): number {
  const hand = gameState.computerHand;
  const playerCard = gameState.playerPlayedCard;

  if (playerCard) {
    const winningCards = hand.filter(card => card.power > playerCard.power);

    if (winningCards.length > 0) {
      const bestCard = winningCards.reduce((min, card) =>
        card.power < min.power ? card : min);
      return hand.indexOf(bestCard);
    } else {
      const worstCard = hand.reduce((min, card) =>
        card.power < min.power ? card : min);
      return hand.indexOf(worstCard);
    }
  } else {
    if (gameState.currentRound === 1) {
      const sortedHand = [...hand].sort((a, b) => a.power - b.power);
      const middleCard = sortedHand[Math.floor(sortedHand.length / 2)];
      return hand.indexOf(middleCard);
    } else {
      const bestCard = hand.reduce((max, card) =>
        card.power > max.power ? card : max);
      return hand.indexOf(bestCard);
    }
  }
}

function selectOptimalAICard(gameState: GameState): number {
  const hand = gameState.computerHand;
  const playerCard = gameState.playerPlayedCard;

  if (playerCard) {
    const canWin = hand.some(card => card.power > playerCard.power);

    if (canWin) {
      const winningCards = hand.filter(card => card.power > playerCard.power);
      const optimalCard = winningCards.reduce((min, card) =>
        card.power < min.power ? card : min);
      return hand.indexOf(optimalCard);
    } else {
      const worstCard = hand.reduce((min, card) =>
        card.power < min.power ? card : min);
      return hand.indexOf(worstCard);
    }
  } else {
    return selectOptimalOpeningCard(gameState);
  }
}

function selectOptimalOpeningCard(gameState: GameState): number {
  const hand = gameState.computerHand;
  const roundsWon = gameState.roundsWon;

  if (roundsWon.computer === 0 && roundsWon.player === 0) {
    const sortedHand = [...hand].sort((a, b) => b.power - a.power);
    return hand.indexOf(sortedHand[1] || sortedHand[0]);
  } else if (roundsWon.computer > roundsWon.player) {
    const sortedHand = [...hand].sort((a, b) => a.power - b.power);
    return hand.indexOf(sortedHand[0]);
  } else {
    const bestCard = hand.reduce((max, card) =>
      card.power > max.power ? card : max);
    return hand.indexOf(bestCard);
  }
}

function calculateHandStrength(hand: Card[]): number {
  if (!hand || hand.length === 0) return 0;

  const totalPower = hand.reduce((sum, card) => sum + card.power, 0);
  const maxPossiblePower = 14 + 13 + 12;

  return Math.min(100, (totalPower / maxPossiblePower) * 100);
}