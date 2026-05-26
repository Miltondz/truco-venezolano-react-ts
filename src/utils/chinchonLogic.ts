import { Card, AICharacter } from '../types';
import { cards as allCards } from './cards';

// ── Deck ──────────────────────────────────────────────────────────────────

export function shuffleChinchonDeck(): Card[] {
  const deck = [...allCards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// ── Card value for scoring (cards left in hand when opponent closes) ───────

export function chinchonCardValue(card: Card): number {
  // Figures = 10, numbers = face value, As = 1
  if (card.value >= 10) return 10;
  return card.value; // 1–7
}

// ── Meld detection ─────────────────────────────────────────────────────────

export interface Meld {
  type: 'run' | 'set';
  cards: Card[];
}

// Canonical order for runs: 1,2,3,4,5,6,7,10,11,12
const RUN_ORDER = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

function runPos(value: number): number {
  return RUN_ORDER.indexOf(value);
}

function isConsecutive(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  const sameSuit = cards.every(c => c.suit === cards[0].suit);
  if (!sameSuit) return false;
  const positions = cards.map(c => runPos(c.value)).sort((a, b) => a - b);
  for (let i = 1; i < positions.length; i++) {
    if (positions[i] !== positions[i - 1] + 1) return false;
  }
  return true;
}

function isSet(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  const sameValue = cards.every(c => c.value === cards[0].value);
  return sameValue;
}

// Find all possible melds in a hand — returns one valid partition or null
export function findBestMeldPartition(hand: Card[]): Meld[] | null {
  return findPartition(hand, []);
}

function findPartition(remaining: Card[], acc: Meld[]): Meld[] | null {
  if (remaining.length === 0) return acc;

  // Try every subset of size 3–remaining.length as a meld
  for (let size = Math.min(remaining.length, 7); size >= 3; size--) {
    for (const subset of combinations(remaining, size)) {
      if (isConsecutive(subset) || isSet(subset)) {
        const rest = remaining.filter(c => !subset.includes(c));
        const result = findPartition(rest, [
          ...acc,
          { type: isConsecutive(subset) ? 'run' : 'set', cards: subset }
        ]);
        if (result !== null) return result;
      }
    }
  }
  return null;
}

function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (k > arr.length) return [];
  const [first, ...rest] = arr;
  return [
    ...combinations(rest, k - 1).map(c => [first, ...c]),
    ...combinations(rest, k),
  ];
}

// Points remaining in unmelded cards
export function deadwoodPoints(hand: Card[], melds: Meld[]): number {
  const meldedCards = new Set(melds.flatMap(m => m.cards));
  return hand.filter(c => !meldedCards.has(c)).reduce((s, c) => s + chinchonCardValue(c), 0);
}

// Check if hand can go out (all 7 in melds = Chinchón)
export function isChinchon(hand: Card[]): boolean {
  if (hand.length !== 7) return false;
  return findBestMeldPartition(hand) !== null;
}

// ── AI Discard Selection ──────────────────────────────────────────────────

export function aiSelectDiscard(
  hand: Card[],
  drawnCard: Card,
  opponent: AICharacter | null
): number {
  const calculo = opponent?.consistencia ?? 5;

  const fullHand = [...hand, drawnCard];

  // Try removing each card and score deadwood
  let bestScore = Infinity;
  let bestIndex = fullHand.length - 1; // default: discard drawn card

  for (let i = 0; i < fullHand.length; i++) {
    const candidate = fullHand.filter((_, idx) => idx !== i);
    const melds = findBestMeldPartition(candidate) ?? [];
    const dw = deadwoodPoints(candidate, melds);

    if (dw < bestScore) {
      bestScore = dw;
      bestIndex = i;
    }
  }

  if (calculo <= 3) {
    // Easy: 60% best, 40% random
    return Math.random() < 0.6 ? bestIndex : Math.floor(Math.random() * fullHand.length);
  }

  return bestIndex;
}

// Should AI draw from discard pile?
export function aiShouldDrawDiscard(
  hand: Card[],
  topDiscard: Card,
  opponent: AICharacter | null
): boolean {
  const calculo = opponent?.consistencia ?? 5;
  if (calculo <= 3) return Math.random() < 0.25;

  // Check if discard improves best meld score
  const withDiscard = [...hand, topDiscard];
  const withDiscardMelds = findBestMeldPartition(withDiscard.slice(0, 7)) ?? [];
  const dwWith = deadwoodPoints(hand, withDiscardMelds); // rough approximation

  const melds = findBestMeldPartition(hand) ?? [];
  const dwWithout = deadwoodPoints(hand, melds);

  return dwWith < dwWithout;
}

// Should AI close (ir) this turn?
export function aiShouldClose(
  hand: Card[],
  opponent: AICharacter | null
): boolean {
  const r = opponent?.riesgo ?? 5;
  const melds = findBestMeldPartition(hand) ?? [];
  const dw = deadwoodPoints(hand, melds);
  const threshold = r <= 3 ? 0 : r <= 6 ? 5 : 10;
  return dw <= threshold;
}
