import { Card } from '../types';
import { cards as allCards } from './cards';
import { AICharacter } from '../types';

export type V21Result =
  | 'player-blackjack'
  | 'dealer-blackjack'
  | 'both-blackjack'
  | 'player-win'
  | 'dealer-bust'
  | 'dealer-win'
  | 'player-bust'
  | 'tie';

export interface HandTotal {
  total: number;
  soft: boolean; // true if at least one ace is counted as 11
}

export function handTotal(hand: Card[]): HandTotal {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    if (c.value === 1) { aces++; total += 11; }
    else if (c.value >= 10) total += 10;
    else total += c.value;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return { total, soft: aces > 0 };
}

export function isBust(total: number): boolean {
  return total > 21;
}

export function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && handTotal(hand).total === 21;
}

export function shuffleV21Deck(): Card[] {
  const deck = [...allCards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function dealCard(deck: Card[]): { card: Card; remaining: Card[] } {
  if (deck.length === 0) throw new Error('Empty deck');
  const [card, ...remaining] = deck;
  return { card, remaining };
}

export function dealerShouldDraw(
  dealerTotal: HandTotal,
  _opponent?: AICharacter | null
): boolean {
  if (dealerTotal.total > 17) return false;
  if (dealerTotal.total === 17 && !dealerTotal.soft) return false; // stand on hard 17
  return true; // hit on soft 17 or below
}

export function evaluateResult(playerHand: Card[], dealerHand: Card[]): V21Result {
  const { total: pTotal } = handTotal(playerHand);
  const { total: dTotal } = handTotal(dealerHand);
  const playerBJ = isBlackjack(playerHand);
  const dealerBJ = isBlackjack(dealerHand);

  if (playerBJ && dealerBJ) return 'both-blackjack';
  if (playerBJ) return 'player-blackjack';
  if (dealerBJ) return 'dealer-blackjack';
  if (isBust(pTotal)) return 'player-bust';
  if (isBust(dTotal)) return 'dealer-bust';
  if (pTotal > dTotal) return 'player-win';
  if (dTotal > pTotal) return 'dealer-win';
  return 'tie';
}

export function chipsDelta(bet: number, doubled: boolean, result: V21Result): number {
  const actualBet = doubled ? bet * 2 : bet;
  switch (result) {
    case 'player-blackjack': return Math.floor(actualBet * 1.5); // 3:2
    case 'dealer-blackjack': return -actualBet;
    case 'both-blackjack':   return 0;
    case 'player-win':       return actualBet;
    case 'dealer-bust':      return actualBet;
    case 'dealer-win':       return -actualBet;
    case 'player-bust':      return -actualBet;
    case 'tie':              return 0;
  }
}

export function getResultLabel(result: V21Result): string {
  switch (result) {
    case 'player-blackjack': return '🂡 ¡BLACKJACK!';
    case 'dealer-blackjack': return 'Blackjack del Dealer';
    case 'both-blackjack':   return 'Doble Blackjack — Empate';
    case 'player-win':       return '¡Ganaste!';
    case 'dealer-bust':      return '¡Dealer Se Pasó!';
    case 'dealer-win':       return 'Dealer Gana';
    case 'player-bust':      return '¡Te Pasaste!';
    case 'tie':              return 'Empate';
  }
}

export function getResultMessage(result: V21Result, bet: number, doubled: boolean): string {
  const delta = chipsDelta(bet, doubled, result);
  const deltaStr = delta > 0 ? `+${delta}` : String(delta);
  switch (result) {
    case 'player-blackjack': return `¡Blackjack perfecto! ${deltaStr} fichas (3:2)`;
    case 'dealer-blackjack': return `El dealer tiene Blackjack. ${deltaStr} fichas`;
    case 'both-blackjack':   return `Ambos con Blackjack — recuperas tu apuesta`;
    case 'player-win':       return `Ganaste con más puntos. ${deltaStr} fichas`;
    case 'dealer-bust':      return `El dealer se pasó de 21. ${deltaStr} fichas`;
    case 'dealer-win':       return `El dealer tiene más puntos. ${deltaStr} fichas`;
    case 'player-bust':      return `Te pasaste de 21. ${deltaStr} fichas`;
    case 'tie':              return `Empate — recuperas tu apuesta`;
  }
}
