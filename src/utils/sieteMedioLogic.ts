import { Card } from '../types';
import { cards as allCards } from './cards';
import { AICharacter } from '../types';

export function cardSMValue(card: Card): number {
  return card.value >= 10 ? 0.5 : card.value;
}

export function handTotal(hand: Card[]): number {
  return hand.reduce((sum, c) => sum + cardSMValue(c), 0);
}

export function isBust(total: number): boolean {
  return total > 7.5;
}

export function isSieteMedio(total: number): boolean {
  return total === 7.5;
}

export function shuffleSMDeck(): Card[] {
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
  dealerTotal: number,
  playerTotal: number,
  opponent: AICharacter | null,
  deck: Card[]
): boolean {
  if (dealerTotal >= 7.5) return false;

  const bustCards = deck.filter(c => dealerTotal + cardSMValue(c) > 7.5).length;
  const bustProb = deck.length > 0 ? bustCards / deck.length : 1;

  if (dealerTotal > playerTotal) {
    // Winning — decide whether to push for more based on riesgo
    const riesgo = opponent?.riesgo ?? 5;
    const greedThreshold = 5.5 + (riesgo / 10) * 1.5; // 5.5–7.0
    if (dealerTotal >= greedThreshold) return false;
    // Don't draw if bust risk is high
    return bustProb < 0.5;
  }

  // Losing or tied — must try to improve
  const calculo = opponent?.consistencia ?? 5;
  const bustTolerance = 0.55 + (calculo / 10) * 0.3; // 0.55–0.85
  return bustProb < bustTolerance;
}

export type SMResult =
  | 'player-siete'
  | 'dealer-siete'
  | 'player-win'
  | 'dealer-win'
  | 'tie'
  | 'player-bust'
  | 'dealer-bust';

export function evaluateResult(playerTotal: number, dealerTotal: number): SMResult {
  if (isBust(playerTotal)) return 'player-bust';
  if (isBust(dealerTotal)) return 'dealer-bust';

  if (isSieteMedio(playerTotal) && !isSieteMedio(dealerTotal)) return 'player-siete';
  if (isSieteMedio(dealerTotal) && !isSieteMedio(playerTotal)) return 'dealer-siete';

  if (playerTotal > dealerTotal) return 'player-win';
  if (dealerTotal > playerTotal) return 'dealer-win';
  return 'tie';
}

export function chipsDelta(bet: number, doubled: boolean, result: SMResult): number {
  const actualBet = doubled ? bet * 2 : bet;
  switch (result) {
    case 'player-siete': return actualBet * 2;  // 2:1 bonus
    case 'dealer-siete': return -actualBet;
    case 'player-win': return actualBet;
    case 'dealer-win': return -actualBet;
    case 'tie': return 0;
    case 'player-bust': return -actualBet;
    case 'dealer-bust': return actualBet;
  }
}

export function formatTotal(total: number): string {
  return total % 1 === 0 ? String(total) : total.toFixed(1);
}

export function getResultLabel(result: SMResult): string {
  switch (result) {
    case 'player-siete': return '¡SIETE Y MEDIO!';
    case 'dealer-siete': return 'Siete y Medio del Dealer';
    case 'player-win': return '¡Ganaste!';
    case 'dealer-win': return 'Dealer Gana';
    case 'tie': return 'Empate';
    case 'player-bust': return '¡Te Pasaste!';
    case 'dealer-bust': return '¡Dealer Se Pasó!';
  }
}

export function getResultMessage(result: SMResult, bet: number, doubled: boolean): string {
  const delta = chipsDelta(bet, doubled, result);
  const deltaStr = delta > 0 ? `+${delta}` : String(delta);
  switch (result) {
    case 'player-siete': return `¡Siete y Medio perfecto! ${deltaStr} fichas (2:1)`;
    case 'dealer-siete': return `El dealer tiene Siete y Medio. ${deltaStr} fichas`;
    case 'player-win': return `Ganaste con más puntos. ${deltaStr} fichas`;
    case 'dealer-win': return `El dealer tiene más puntos. ${deltaStr} fichas`;
    case 'tie': return `Empate — recuperas tu apuesta`;
    case 'player-bust': return `Te pasaste de 7.5. ${deltaStr} fichas`;
    case 'dealer-bust': return `El dealer se pasó. ${deltaStr} fichas`;
  }
}
