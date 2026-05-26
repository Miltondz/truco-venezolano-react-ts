import { Card, AICharacter } from '../types';
import { shuffleDeck } from './cards';

// ── Card rankings ──────────────────────────────────────────────────────────

export function getBriscaRank(card: Card): number {
  switch (card.value) {
    case 1: return 9;   // As — highest
    case 3: return 8;   // Tres
    case 12: return 7;  // Rey
    case 11: return 6;  // Caballo
    case 10: return 5;  // Sota
    case 7: return 4;
    case 6: return 3;
    case 5: return 2;
    case 4: return 1;
    default: return 0;
  }
}

export function getBriscaPoints(card: Card): number {
  switch (card.value) {
    case 1: return 11;
    case 3: return 10;
    case 12: return 4;
    case 11: return 3;
    case 10: return 2;
    default: return 0;
  }
}

export function countPoints(cards: Card[]): number {
  return cards.reduce((sum, c) => sum + getBriscaPoints(c), 0);
}

// ── Trick resolution ───────────────────────────────────────────────────────

export function resolveTrick(
  leaderCard: Card,
  followerCard: Card,
  trumpSuit: string,
  leaderIsPlayer: boolean
): 'player' | 'computer' {
  const lTrump = leaderCard.suit === trumpSuit;
  const fTrump = followerCard.suit === trumpSuit;

  if (lTrump && !fTrump) return leaderIsPlayer ? 'player' : 'computer';
  if (fTrump && !lTrump) return leaderIsPlayer ? 'computer' : 'player';

  // Both same category (both trump or both non-trump)
  if (leaderCard.suit === followerCard.suit || (lTrump && fTrump)) {
    const lRank = getBriscaRank(leaderCard);
    const fRank = getBriscaRank(followerCard);
    if (fRank > lRank) return leaderIsPlayer ? 'computer' : 'player';
    return leaderIsPlayer ? 'player' : 'computer';
  }

  // Different suits, neither trump — leader wins
  return leaderIsPlayer ? 'player' : 'computer';
}

// ── Initial deal ──────────────────────────────────────────────────────────

export interface BriscaDeal {
  playerHand: Card[];
  computerHand: Card[];
  deck: Card[];       // remaining deck; trump card is deck[deck.length - 1]
  trumpCard: Card;
  trumpSuit: string;
}

export function dealBrisca(): BriscaDeal {
  const shuffled = shuffleDeck();
  const playerHand = shuffled.slice(0, 3);
  const computerHand = shuffled.slice(3, 6);
  const deck = shuffled.slice(6);                    // 34 cards
  const trumpCard = deck[deck.length - 1];           // visible bottom card
  return { playerHand, computerHand, deck, trumpCard, trumpSuit: trumpCard.suit };
}

// Draw one card from the top of the deck
export function drawOne(deck: Card[]): { card: Card | null; remaining: Card[] } {
  if (deck.length === 0) return { card: null, remaining: [] };
  const [card, ...remaining] = deck;
  return { card, remaining };
}

// ── AI card selection ─────────────────────────────────────────────────────

export function selectAICard(
  hand: Card[],
  leadCard: Card | null,       // null when AI leads
  trumpSuit: string,
  playerLeads: boolean,
  opponent: AICharacter | null
): number {
  if (hand.length === 0) return 0;

  const riesgo = opponent?.riesgo ?? 5;
  const agresividad = opponent?.agresividad ?? 5;
  const calculo = opponent?.consistencia ?? 5;

  // ── AI leads the trick ──────────────────────────────────────────────────
  if (!leadCard) {
    if (calculo <= 3) return Math.floor(Math.random() * hand.length); // easy: random

    // Prefer to lead with cheap non-trump cards; save trumps and high cards
    const nonTrumpWorthless = hand
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c.suit !== trumpSuit && getBriscaPoints(c) === 0)
      .sort((a, b) => getBriscaRank(a.c) - getBriscaRank(b.c));

    if (nonTrumpWorthless.length > 0 && riesgo <= 6) return nonTrumpWorthless[0].i;

    // Lead high non-trump if aggressive
    const nonTrump = hand
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c.suit !== trumpSuit)
      .sort((a, b) => getBriscaRank(b.c) - getBriscaRank(a.c));

    if (nonTrump.length > 0) return nonTrump[0].i;
    // Only trumps left — lead lowest trump
    return hand
      .map((c, i) => ({ c, i }))
      .sort((a, b) => getBriscaRank(a.c) - getBriscaRank(b.c))[0].i;
  }

  // ── AI responds to leader's card ────────────────────────────────────────
  const leadPoints = getBriscaPoints(leadCard);
  const leadRank = getBriscaRank(leadCard);
  const leadTrump = leadCard.suit === trumpSuit;

  // Cards that beat the lead
  const winning = hand
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => {
      if (leadTrump) return c.suit === trumpSuit && getBriscaRank(c) > leadRank;
      return (
        (c.suit === trumpSuit) ||
        (c.suit === leadCard.suit && getBriscaRank(c) > leadRank)
      );
    });

  // Throwaway: lowest point, lowest rank
  const throwaway = [...hand]
    .map((c, i) => ({ c, i }))
    .sort((a, b) => getBriscaPoints(a.c) - getBriscaPoints(b.c) || getBriscaRank(a.c) - getBriscaRank(b.c));

  if (winning.length === 0) {
    // Can't win — throw cheapest card
    return throwaway[0].i;
  }

  // Should we try to win?
  if (leadPoints === 0) {
    // Lead card has no points — not worth wasting a trump
    if (riesgo <= 5) {
      // Don't use a trump; throw cheapest card
      const nonTrumpThrow = hand
        .map((c, i) => ({ c, i }))
        .filter(({ c }) => c.suit !== trumpSuit)
        .sort((a, b) => getBriscaPoints(a.c) - getBriscaPoints(b.c));
      if (nonTrumpThrow.length > 0) return nonTrumpThrow[0].i;
    }
  }

  // Win with cheapest winning card (save expensive ones)
  const cheapestWin = winning
    .sort((a, b) => getBriscaPoints(a.c) - getBriscaPoints(b.c) || getBriscaRank(a.c) - getBriscaRank(b.c));

  // If lead has points or AI is aggressive — win
  if (leadPoints > 0 || agresividad >= 7) return cheapestWin[0].i;

  // Otherwise throw away
  return throwaway[0].i;
}
