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

// Venezuelan Truco helpers
export function getPericoPericaForVira(viraCard: Card): { perico: { suit: string; value: number }, perica: { suit: string; value: number } } {
  const suit = viraCard.suit;
  // Base pieces
  let pericoValue = 11; // Caballo
  let pericaValue = 10; // Sota
  // If vira is a Caballo or Sota, that figure is replaced by Rey for that piece
  if (viraCard.value === 11) {
    pericoValue = 12; // Rey sustituye al Caballo
  }
  if (viraCard.value === 10) {
    pericaValue = 12; // Rey sustituye a la Sota
  }
  return {
    perico: { suit, value: pericoValue },
    perica: { suit, value: pericaValue }
  };
}

export function isPerico(card: Card, viraCard: Card): boolean {
  const { perico } = getPericoPericaForVira(viraCard);
  return card.suit === perico.suit && card.value === perico.value;
}

export function isPerica(card: Card, viraCard: Card): boolean {
  const { perica } = getPericoPericaForVira(viraCard);
  return card.suit === perica.suit && card.value === perica.value;
}

export function getCardTrucoRank(card: Card, viraCard: Card): number {
  // Higher is stronger. Build according to Venezuelan order
  // 100 Perico, 99 Perica, 98 Espadilla (As Espadas), 97 Bastillo (As Bastos),
  // 96 7 Espadas, 95 7 Oros, 94.. for 3s, 93.. for 2s, 92 As de Oro, 91 As de Copas,
  // 90 Reyes, 80 Caballos, 70 Sotas, 60 7 Copas, 59 7 Bastos, 50 6s, 40 5s, 30 4s
  if (isPerico(card, viraCard)) return 100;
  if (isPerica(card, viraCard)) return 99;

  if (card.suit === 'espadas' && card.value === 1) return 98; // Espadilla
  if (card.suit === 'bastos' && card.value === 1) return 97; // Bastillo
  if (card.suit === 'espadas' && card.value === 7) return 96;
  if (card.suit === 'oros' && card.value === 7) return 95;

  if (card.value === 3) return 94;
  if (card.value === 2) return 93;

  if (card.suit === 'oros' && card.value === 1) return 92; // As Oro
  if (card.suit === 'copas' && card.value === 1) return 91; // As Copas

  if (card.value === 12) return 90; // Rey
  if (card.value === 11) return 80; // Caballo (no pieza)
  if (card.value === 10) return 70; // Sota (no pieza)

  if (card.suit === 'copas' && card.value === 7) return 60; // 7 Copas
  if (card.suit === 'bastos' && card.value === 7) return 59; // 7 Bastos

  if (card.value === 6) return 50;
  if (card.value === 5) return 40;
  if (card.value === 4) return 30;

  return 0;
}

export function calculateEnvidoPoints(hand: Card[], viraCard: Card): number {
  const { perico, perica } = getPericoPericaForVira(viraCard);
  // Detect pieces in hand
  const hasPerico = hand.some(c => c.suit === perico.suit && c.value === perico.value);
  const hasPerica = hand.some(c => c.suit === perica.suit && c.value === perica.value);

  if (hasPerico) {
    // 30 + highest of the other two cards (envidoValue)
    const others = hand.filter(c => !(c.suit === perico.suit && c.value === perico.value));
    const maxOther = others.reduce((m, c) => Math.max(m, c.envidoValue), 0);
    return 30 + maxOther;
  }
  if (hasPerica) {
    const others = hand.filter(c => !(c.suit === perica.suit && c.value === perica.value));
    const maxOther = others.reduce((m, c) => Math.max(m, c.envidoValue), 0);
    return 29 + maxOther;
  }

  // Group by suit for 20 + sum of top two of same suit
  const suits: Record<string, number[]> = {};
  hand.forEach(card => {
    if (!suits[card.suit]) suits[card.suit] = [];
    suits[card.suit].push(card.envidoValue);
  });

  let best = 0;
  Object.keys(suits).forEach(suit => {
    const vals = suits[suit];
    if (vals.length >= 2) {
      const sorted = vals.sort((a, b) => b - a);
      const points = 20 + sorted[0] + sorted[1];
      best = Math.max(best, points);
    }
  });

  if (best > 0) return best;
  // No pair, return highest single
  return hand.reduce((m, c) => Math.max(m, c.envidoValue), 0);
}

export function hasFlor(hand: Card[], viraCard: Card): boolean {
  // Flor blanca: 3 de la misma pinta
  const suitsCount: Record<string, number> = {};
  hand.forEach(card => {
    suitsCount[card.suit] = (suitsCount[card.suit] || 0) + 1;
  });
  const hasThreeSameSuit = Object.values(suitsCount).some(count => count === 3);
  if (hasThreeSameSuit) return true;

  // Flor con Pieza: Pieza + otras dos cartas de la misma pinta
  const { perico, perica } = getPericoPericaForVira(viraCard);
  const pericoInHand = hand.some(c => c.suit === perico.suit && c.value === perico.value);
  const pericaInHand = hand.some(c => c.suit === perica.suit && c.value === perica.value);

  if (pericoInHand || pericaInHand) {
    // Count suits excluding the piece for the same suit condition
    const countsExcludingPiece: Record<string, number> = {};
    hand.forEach(c => {
      const isPiece = (c.suit === perico.suit && c.value === perico.value) || (c.suit === perica.suit && c.value === perica.value);
      if (!isPiece) countsExcludingPiece[c.suit] = (countsExcludingPiece[c.suit] || 0) + 1;
    });
    if (Object.values(countsExcludingPiece).some(cnt => cnt >= 2)) return true;
  }

  // Flor Reservada: ambas piezas
  if (pericoInHand && pericaInHand) return true;

  return false;
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