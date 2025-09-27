import { Card, suitFileMap } from '../types';

// Cartas del juego (baraja española) - MODIFICADO
export const cards: Card[] = [
  // Espadas
  { suit: 'espadas', value: 1, name: 'As de Espadas', power: 14, image: '🂡', envidoValue: 1, imageFile: `1-${suitFileMap.espadas}.jpg` },
  { suit: 'espadas', value: 2, name: '2 de Espadas', power: 9, image: '🂢', envidoValue: 2, imageFile: `2-${suitFileMap.espadas}.jpg` },
  { suit: 'espadas', value: 3, name: '3 de Espadas', power: 10, image: '🂣', envidoValue: 3, imageFile: `3-${suitFileMap.espadas}.jpg` },
  { suit: 'espadas', value: 4, name: '4 de Espadas', power: 1, image: '🂤', envidoValue: 4, imageFile: `4-${suitFileMap.espadas}.jpg` },
  { suit: 'espadas', value: 5, name: '5 de Espadas', power: 2, image: '🂥', envidoValue: 5, imageFile: `5-${suitFileMap.espadas}.jpg` },
  { suit: 'espadas', value: 6, name: '6 de Espadas', power: 3, image: '🂦', envidoValue: 6, imageFile: `6-${suitFileMap.espadas}.jpg` },
  { suit: 'espadas', value: 7, name: '7 de Espadas', power: 12, image: '🂧', envidoValue: 7, imageFile: `7-${suitFileMap.espadas}.jpg` },
  { suit: 'espadas', value: 10, name: 'Sota de Espadas', power: 5, image: '🂫', envidoValue: 0, imageFile: `10-${suitFileMap.espadas}.jpg` },
  { suit: 'espadas', value: 11, name: 'Caballo de Espadas', power: 6, image: '🂭', envidoValue: 0, imageFile: `11-${suitFileMap.espadas}.jpg` },
  { suit: 'espadas', value: 12, name: 'Rey de Espadas', power: 7, image: '🂮', envidoValue: 0, imageFile: `12-${suitFileMap.espadas}.jpg` },

  // Bastos
  { suit: 'bastos', value: 1, name: 'As de Bastos', power: 13, image: '🃑', envidoValue: 1, imageFile: `1-${suitFileMap.bastos}.jpg` },
  { suit: 'bastos', value: 2, name: '2 de Bastos', power: 9, image: '🃒', envidoValue: 2, imageFile: `2-${suitFileMap.bastos}.jpg` },
  { suit: 'bastos', value: 3, name: '3 de Bastos', power: 10, image: '🃓', envidoValue: 3, imageFile: `3-${suitFileMap.bastos}.jpg` },
  { suit: 'bastos', value: 4, name: '4 de Bastos', power: 1, image: '🃔', envidoValue: 4, imageFile: `4-${suitFileMap.bastos}.jpg` },
  { suit: 'bastos', value: 5, name: '5 de Bastos', power: 2, image: '🃕', envidoValue: 5, imageFile: `5-${suitFileMap.bastos}.jpg` },
  { suit: 'bastos', value: 6, name: '6 de Bastos', power: 3, image: '🃖', envidoValue: 6, imageFile: `6-${suitFileMap.bastos}.jpg` },
  { suit: 'bastos', value: 7, name: '7 de Bastos', power: 4, image: '🃗', envidoValue: 7, imageFile: `7-${suitFileMap.bastos}.jpg` },
  { suit: 'bastos', value: 10, name: 'Sota de Bastos', power: 5, image: '🃛', envidoValue: 0, imageFile: `10-${suitFileMap.bastos}.jpg` },
  { suit: 'bastos', value: 11, name: 'Caballo de Bastos', power: 6, image: '🃝', envidoValue: 0, imageFile: `11-${suitFileMap.bastos}.jpg` },
  { suit: 'bastos', value: 12, name: 'Rey de Bastos', power: 7, image: '🃞', envidoValue: 0, imageFile: `12-${suitFileMap.bastos}.jpg` },

  // Oros
  { suit: 'oros', value: 1, name: 'As de Oros', power: 8, image: '🃁', envidoValue: 1, imageFile: `1-${suitFileMap.oros}.jpg` },
  { suit: 'oros', value: 2, name: '2 de Oros', power: 9, image: '🃂', envidoValue: 2, imageFile: `2-${suitFileMap.oros}.jpg` },
  { suit: 'oros', value: 3, name: '3 de Oros', power: 10, image: '🃃', envidoValue: 3, imageFile: `3-${suitFileMap.oros}.jpg` },
  { suit: 'oros', value: 4, name: '4 de Oros', power: 1, image: '🃄', envidoValue: 4, imageFile: `4-${suitFileMap.oros}.jpg` },
  { suit: 'oros', value: 5, name: '5 de Oros', power: 2, image: '🃅', envidoValue: 5, imageFile: `5-${suitFileMap.oros}.jpg` },
  { suit: 'oros', value: 6, name: '6 de Oros', power: 3, image: '🃆', envidoValue: 6, imageFile: `6-${suitFileMap.oros}.jpg` },
  { suit: 'oros', value: 7, name: '7 de Oros', power: 11, image: '🃇', envidoValue: 7, imageFile: `7-${suitFileMap.oros}.jpg` },
  { suit: 'oros', value: 10, name: 'Sota de Oros', power: 5, image: '🃋', envidoValue: 0, imageFile: `10-${suitFileMap.oros}.jpg` },
  { suit: 'oros', value: 11, name: 'Caballo de Oros', power: 6, image: '🃍', envidoValue: 0, imageFile: `11-${suitFileMap.oros}.jpg` },
  { suit: 'oros', value: 12, name: 'Rey de Oros', power: 7, image: '🃎', envidoValue: 0, imageFile: `12-${suitFileMap.oros}.jpg` },

  // Copas
  { suit: 'copas', value: 1, name: 'As de Copas', power: 8, image: '🃱', envidoValue: 1, imageFile: `1-${suitFileMap.copas}.jpg` },
  { suit: 'copas', value: 2, name: '2 de Copas', power: 9, image: '🃲', envidoValue: 2, imageFile: `2-${suitFileMap.copas}.jpg` },
  { suit: 'copas', value: 3, name: '3 de Copas', power: 10, image: '🃳', envidoValue: 3, imageFile: `3-${suitFileMap.copas}.jpg` },
  { suit: 'copas', value: 4, name: '4 de Copas', power: 1, image: '🃴', envidoValue: 4, imageFile: `4-${suitFileMap.copas}.jpg` },
  { suit: 'copas', value: 5, name: '5 de Copas', power: 2, image: '🃵', envidoValue: 5, imageFile: `5-${suitFileMap.copas}.jpg` },
  { suit: 'copas', value: 6, name: '6 de Copas', power: 3, image: '🃶', envidoValue: 6, imageFile: `6-${suitFileMap.copas}.jpg` },
  { suit: 'copas', value: 7, name: '7 de Copas', power: 4, image: '🃷', envidoValue: 7, imageFile: `7-${suitFileMap.copas}.jpg` },
  { suit: 'copas', value: 10, name: 'Sota de Copas', power: 5, image: '🃻', envidoValue: 0, imageFile: `10-${suitFileMap.copas}.jpg` },
  { suit: 'copas', value: 11, name: 'Caballo de Copas', power: 6, image: '🃽', envidoValue: 0, imageFile: `11-${suitFileMap.copas}.jpg` },
  { suit: 'copas', value: 12, name: 'Rey de Copas', power: 7, image: '🃾', envidoValue: 0, imageFile: `12-${suitFileMap.copas}.jpg` }
];

export function shuffleDeck(): Card[] {
  return [...cards].sort(() => Math.random() - 0.5);
}

export function calculateEnvidoPoints(hand: Card[]): number {
  const suits: Record<string, number[]> = {};

  hand.forEach(card => {
    if (!suits[card.suit]) suits[card.suit] = [];
    suits[card.suit].push(card.envidoValue);
  });

  let maxPoints = 0;

  Object.keys(suits).forEach(suit => {
    if (suits[suit].length >= 2) {
      const sortedCards = suits[suit].sort((a, b) => b - a);
      let points = sortedCards[0] + sortedCards[1];
      if (points < 20) points += 20;
      maxPoints = Math.max(maxPoints, points);
    }
  });

  return maxPoints;
}

export function hasFlor(hand: Card[]): boolean {
  const suits: Record<string, number> = {};
  hand.forEach(card => {
    suits[card.suit] = (suits[card.suit] || 0) + 1;
  });

  return Object.values(suits).some(count => count === 3);
}

export function calculateHandStrength(hand: Card[]): number {
  if (!hand || hand.length === 0) return 0;

  const totalPower = hand.reduce((sum, card) => sum + card.power, 0);
  const maxPossiblePower = 14 + 13 + 12;

  return Math.min(100, (totalPower / maxPossiblePower) * 100);
}

export function getPericoCard(viraCard: Card): Card {
  // Find the card with the same suit as vira but next lower value
  const sameSuitCards = cards.filter(card => card.suit === viraCard.suit && card.value !== viraCard.value);

  // Sort by value descending to get the next lower card
  const sortedCards = sameSuitCards.sort((a, b) => b.value - a.value);

  // Find the card with the highest value that's lower than vira
  const pericoCard = sortedCards.find(card => card.value < viraCard.value);

  // If no lower card found (vira is the lowest), wrap around to the highest card of the same suit
  if (!pericoCard) {
    return sameSuitCards.reduce((highest, current) =>
      current.value > highest.value ? current : highest
    );
  }

  return pericoCard;
}