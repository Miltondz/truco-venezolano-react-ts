import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BaseScreenProps, AICharacter, Card, DECKS } from '../types';
import { getActiveAICharacters } from '../data/aiCharacters';
import {
  dealBrisca, drawOne, resolveTrick, selectAICard,
  getBriscaPoints, countPoints
} from '../utils/briscaLogic';

type SubPhase =
  | 'player-lead'
  | 'computer-lead'
  | 'player-respond'
  | 'trick-resolution'
  | 'game-over';

interface BriscaState {
  deck: Card[];
  playerHand: Card[];
  computerHand: Card[];
  trumpCard: Card | null;
  trumpSuit: string;
  playerCaptured: Card[];
  computerCaptured: Card[];
  playerLeads: boolean;
  playerPlayed: Card | null;
  computerPlayed: Card | null;
  subPhase: SubPhase;
  message: string;
  gamesWon: number;
  gamesLost: number;
  isProcessing: boolean;
}

function emptyState(): BriscaState {
  return {
    deck: [], playerHand: [], computerHand: [],
    trumpCard: null, trumpSuit: '',
    playerCaptured: [], computerCaptured: [],
    playerLeads: true,
    playerPlayed: null, computerPlayed: null,
    subPhase: 'player-lead',
    message: '', gamesWon: 0, gamesLost: 0,
    isProcessing: false,
  };
}

const TRICK_SHOW_MS = 1800;

const BRISCA_TUTORIAL_KEY = 'brisca-tutorial-seen';

const BriscaScreen: React.FC<BaseScreenProps> = ({ onNavigate }) => {
  const [showTutorial, setShowTutorial] = useState(() => localStorage.getItem(BRISCA_TUTORIAL_KEY) !== 'true');
  const dismissTutorial = (permanent: boolean) => {
    if (permanent) localStorage.setItem(BRISCA_TUTORIAL_KEY, 'true');
    setShowTutorial(false);
  };

  const [setupDone, setSetupDone] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState('default');
  const [opponent, setOpponent] = useState<AICharacter | null>(null);
  const [opponents] = useState(() => getActiveAICharacters());
  const [gs, setGs] = useState<BriscaState>(emptyState);

  // Always-fresh ref so async callbacks don't read stale state
  const gsRef = useRef(gs);
  gsRef.current = gs;
  const opponentRef = useRef(opponent);
  opponentRef.current = opponent;
  const selectedDeckRef = useRef(selectedDeck);
  selectedDeckRef.current = selectedDeck;

  const pendingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => {
    pendingTimers.current.forEach(clearTimeout);
    pendingTimers.current = [];
  };
  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    pendingTimers.current.push(t);
    return t;
  };

  useEffect(() => {
    if (opponents.length > 0 && !opponent) setOpponent(opponents[0]);
  }, [opponents, opponent]);

  useEffect(() => () => clearTimers(), []);

  // ── Game state helpers ────────────────────────────────────────────────────

  function applyTrickEnd(state: BriscaState, winner: 'player' | 'computer'): BriscaState {
    const trickCards = [state.playerPlayed, state.computerPlayed].filter(Boolean) as Card[];
    const newPCap = winner === 'player'
      ? [...state.playerCaptured, ...trickCards]
      : state.playerCaptured;
    const newCCap = winner === 'computer'
      ? [...state.computerCaptured, ...trickCards]
      : state.computerCaptured;

    let deck = state.deck;
    let pHand = state.playerHand;
    let cHand = state.computerHand;

    if (deck.length > 0) {
      const { card: w, remaining: r1 } = drawOne(deck);
      const { card: l, remaining: r2 } = drawOne(r1);
      deck = r2;
      if (winner === 'player') {
        if (w) pHand = [...pHand, w];
        if (l) cHand = [...cHand, l];
      } else {
        if (w) cHand = [...cHand, w];
        if (l) pHand = [...pHand, l];
      }
    }

    if (pHand.length === 0 && cHand.length === 0 && deck.length === 0) {
      const pPts = countPoints(newPCap);
      const cPts = countPoints(newCCap);
      const playerWins = pPts > cPts;
      return {
        ...state,
        deck, playerHand: pHand, computerHand: cHand,
        playerCaptured: newPCap, computerCaptured: newCCap,
        playerPlayed: null, computerPlayed: null,
        subPhase: 'game-over',
        gamesWon: state.gamesWon + (playerWins ? 1 : 0),
        gamesLost: state.gamesLost + (playerWins ? 0 : 1),
        message: playerWins
          ? `¡Ganaste! ${pPts} vs ${cPts} puntos`
          : `El dealer gana. ${cPts} vs ${pPts} puntos`,
        isProcessing: false,
      };
    }

    const nextPlayerLeads = winner === 'player';
    return {
      ...state,
      deck, playerHand: pHand, computerHand: cHand,
      playerCaptured: newPCap, computerCaptured: newCCap,
      playerPlayed: null, computerPlayed: null,
      playerLeads: nextPlayerLeads,
      subPhase: nextPlayerLeads ? 'player-lead' : 'computer-lead',
      message: nextPlayerLeads
        ? 'Ganaste la baza — lidera la siguiente'
        : 'El dealer lidera...',
      isProcessing: !nextPlayerLeads,
    };
  }

  // ── Computer turn (triggered by useEffect) ────────────────────────────────

  const runComputerTurn = useCallback(() => {
    const state = gsRef.current;
    const opp = opponentRef.current;

    if (state.subPhase !== 'computer-lead') return;

    // AI picks lead card
    const aiIdx = selectAICard(state.computerHand, null, state.trumpSuit, false, opp);
    const cCard = state.computerHand[aiIdx];
    const newCHand = state.computerHand.filter((_, i) => i !== aiIdx);

    setGs(prev => ({
      ...prev,
      computerPlayed: cCard,
      computerHand: newCHand,
      subPhase: 'player-respond',
      message: 'El dealer jugó — elige tu respuesta',
      isProcessing: false,
    }));
  }, []);

  // Fire computer lead after delay
  useEffect(() => {
    if (gs.subPhase !== 'computer-lead') return;
    const t = later(runComputerTurn, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gs.subPhase]);

  // ── Player actions ────────────────────────────────────────────────────────

  const startNewGame = useCallback((won = 0, lost = 0) => {
    clearTimers();
    const deal = dealBrisca();
    setGs({
      ...emptyState(),
      deck: deal.deck,
      playerHand: deal.playerHand,
      computerHand: deal.computerHand,
      trumpCard: deal.trumpCard,
      trumpSuit: deal.trumpSuit,
      subPhase: 'player-lead',
      message: 'Tu turno — elige una carta para liderar',
      gamesWon: won,
      gamesLost: lost,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlayerLead = (cardIndex: number) => {
    if (gs.subPhase !== 'player-lead' || gs.isProcessing) return;
    const pCard = gs.playerHand[cardIndex];
    const newPHand = gs.playerHand.filter((_, i) => i !== cardIndex);
    const opp = opponentRef.current;

    setGs(prev => ({
      ...prev,
      playerPlayed: pCard,
      playerHand: newPHand,
      isProcessing: true,
      message: 'El dealer responde...',
    }));

    later(() => {
      const state = gsRef.current;
      const aiIdx = selectAICard(state.computerHand, pCard, state.trumpSuit, true, opp);
      const cCard = state.computerHand[aiIdx];
      const newCHand = state.computerHand.filter((_, i) => i !== aiIdx);
      const winner = resolveTrick(pCard, cCard, state.trumpSuit, true);
      const pts = getBriscaPoints(pCard) + getBriscaPoints(cCard);

      setGs(prev => ({
        ...prev,
        computerPlayed: cCard,
        computerHand: newCHand,
        subPhase: 'trick-resolution',
        message: winner === 'player'
          ? `¡Ganaste la baza! +${pts} pts`
          : `El dealer gana la baza. +${pts} pts`,
      }));

      later(() => {
        setGs(prev => applyTrickEnd(prev, winner));
      }, TRICK_SHOW_MS);
    }, 800);
  };

  const handlePlayerRespond = (cardIndex: number) => {
    if (gs.subPhase !== 'player-respond' || gs.isProcessing) return;
    const pCard = gs.playerHand[cardIndex];
    const cCard = gs.computerPlayed!;
    const newPHand = gs.playerHand.filter((_, i) => i !== cardIndex);
    const winner = resolveTrick(cCard, pCard, gs.trumpSuit, false);
    const pts = getBriscaPoints(pCard) + getBriscaPoints(cCard);

    setGs(prev => ({
      ...prev,
      playerPlayed: pCard,
      playerHand: newPHand,
      subPhase: 'trick-resolution',
      isProcessing: true,
      message: winner === 'player'
        ? `¡Ganaste la baza! +${pts} pts`
        : `El dealer gana la baza. +${pts} pts`,
    }));

    later(() => {
      setGs(prev => applyTrickEnd(prev, winner));
    }, TRICK_SHOW_MS);
  };

  const handleCardClick = (i: number) => {
    if (gs.subPhase === 'player-lead') handlePlayerLead(i);
    else if (gs.subPhase === 'player-respond') handlePlayerRespond(i);
  };

  // ── Derived UI values ─────────────────────────────────────────────────────

  const playerScore = countPoints(gs.playerCaptured);
  const computerScore = countPoints(gs.computerCaptured);
  const canPlay = (gs.subPhase === 'player-lead' || gs.subPhase === 'player-respond') && !gs.isProcessing;

  const cardImg = (card: Card) =>
    `/images/decks/${selectedDeckRef.current}/${card.imageFile}`;

  const fallbackImg = (card: Card) =>
    `/images/decks/default/${card.imageFile}`;

  const cardPts = (card: Card) => {
    switch (card.value) {
      case 1: return 11; case 3: return 10; case 12: return 4;
      case 11: return 3; case 10: return 2; default: return 0;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div id="brisca-screen" className="screen active brisca-screen">
      <button className="back-button" onClick={() => { clearTimers(); onNavigate('main-screen'); }}>← Volver</button>

      {showTutorial && (
        <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-label="Tutorial Brisca">
          <div className="tutorial-card">
            <h3 className="tutorial-title">🎴 Cómo jugar Brisca</h3>
            <ul className="tutorial-rules">
              <li>Objetivo: llega a <strong>61 puntos</strong> antes que tu oponente</li>
              <li>El <strong>triunfo</strong> (última carta del mazo) gana a todos los demás palos</li>
              <li>Rango: <strong>As &gt; Tres &gt; Rey &gt; Caballo &gt; Sota &gt; 7 &gt; 6 &gt; 5 &gt; 4</strong></li>
              <li>Puntos: As=11 · Tres=10 · Rey=4 · Caballo=3 · Sota=2 · resto=0</li>
              <li>El ganador de la baza lidera la siguiente; ambos roban una carta</li>
            </ul>
            <div className="tutorial-actions">
              <button className="tutorial-btn-primary" onClick={() => dismissTutorial(false)}>Entendido</button>
              <button className="tutorial-btn-secondary" onClick={() => dismissTutorial(true)}>No mostrar más</button>
            </div>
          </div>
        </div>
      )}

      {/* SETUP */}
      {!setupDone && (
        <div className="sm-setup screen-content">
          <h2 className="game-title">🎴 Brisca</h2>
          <p className="sm-subtitle">El clásico juego de bazas venezolano</p>

          <div className="sm-setup-section">
            <h3 className="setup-title">Elige tu Baraja</h3>
            <div className="sm-setup-section" style={{ display: 'contents' }}>
              <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: '0.6rem' }}>
                {DECKS.map(d => (
                  <div
                    key={d}
                    className={`selection-item ${selectedDeck === d ? 'selected' : ''}`}
                    onClick={() => setSelectedDeck(d)}
                  >
                    <img src={`/images/decks/${d}/deck-preview.jpg`} alt={d} />
                    <div className="item-name">{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sm-setup-section">
            <h3 className="setup-title">Elige tu Oponente</h3>
            <div className="sm-opponent-list">
              {opponents.slice(0, 4).map(op => (
                <div
                  key={op.id}
                  className={`sm-opponent-card ${opponent?.id === op.id ? 'selected' : ''}`}
                  onClick={() => setOpponent(op)}
                >
                  <img
                    src={`/images/avatars/${op.avatar}`}
                    alt={op.name}
                    onError={e => { (e.target as HTMLImageElement).src = '/images/avatars/avatar1-default.jpg'; }}
                  />
                  <div className="sm-opponent-info">
                    <span className="sm-opponent-name">{op.name}</span>
                    <span className="sm-opponent-diff">{op.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sm-chips-info">
            Llega primero a <strong>61 puntos</strong> para ganar
          </div>

          <button className="menu-button" onClick={() => { if (opponent) { setSetupDone(true); startNewGame(); } }} disabled={!opponent}>
            🎮 Comenzar Juego
          </button>
        </div>
      )}

      {/* GAME */}
      {setupDone && (
        <div className="brisca-game">
          {/* Header bar */}
          <div className="brisca-header">
            {gs.trumpCard && (
              <div className="brisca-trump">
                <span className="brisca-trump-label">Triunfo</span>
                <img
                  src={cardImg(gs.trumpCard)}
                  alt={gs.trumpCard.name}
                  className="brisca-trump-card"
                  onError={e => { (e.target as HTMLImageElement).src = fallbackImg(gs.trumpCard!); }}
                />
              </div>
            )}
            <div className="brisca-scores">
              <div className="brisca-score">
                <span className="brisca-score-label">{opponent?.name ?? 'Dealer'}</span>
                <span className="brisca-score-val">{computerScore}</span>
              </div>
              <div className="brisca-deck-count">
                <span className="brisca-deck-icon">🂠</span>
                <span>{gs.deck.length}</span>
              </div>
              <div className="brisca-score">
                <span className="brisca-score-label">Tú</span>
                <span className="brisca-score-val brisca-score-mine">{playerScore}</span>
              </div>
            </div>
            <div className="brisca-session">
              <span className="brisca-win-badge">✓{gs.gamesWon}</span>
              <span className="brisca-lose-badge">✗{gs.gamesLost}</span>
            </div>
          </div>

          {/* Computer hand (face down) */}
          <div className="brisca-computer-area">
            <div className="brisca-avatar-row">
              {opponent && (
                <img
                  src={`/images/avatars/${opponent.avatar}`}
                  alt={opponent.name}
                  className="brisca-avatar"
                  onError={e => { (e.target as HTMLImageElement).src = '/images/avatars/avatar1-default.jpg'; }}
                />
              )}
              <span className="brisca-area-name">{opponent?.name}</span>
            </div>
            <div className="brisca-hand brisca-hand-computer">
              {gs.computerHand.map((_, i) => (
                <div key={i} className="brisca-card brisca-card-back">
                  <div className="brisca-card-back-inner" />
                </div>
              ))}
            </div>
          </div>

          {/* Play area (center) */}
          <div className="brisca-play-area">
            <div className="brisca-played-col brisca-played-computer">
              {gs.computerPlayed ? (
                <img
                  src={cardImg(gs.computerPlayed)}
                  alt={gs.computerPlayed.name}
                  className="brisca-card brisca-card-played"
                  onError={e => { (e.target as HTMLImageElement).src = fallbackImg(gs.computerPlayed!); }}
                />
              ) : <div className="brisca-empty-slot" />}
            </div>

            <div className="brisca-center-msg">
              <div className={`brisca-message ${gs.subPhase === 'game-over' ? 'brisca-msg-final' : ''}`}>
                {gs.message}
              </div>
              {gs.subPhase === 'game-over' && (
                <div className="brisca-gameover-btns">
                  <button className="menu-button" onClick={() => startNewGame(gs.gamesWon, gs.gamesLost)}>
                    🔄 Nueva Partida
                  </button>
                  <button className="menu-button" style={{ background: 'var(--accent-bg)' }} onClick={() => onNavigate('main-screen')}>
                    🏠 Menú
                  </button>
                </div>
              )}
            </div>

            <div className="brisca-played-col brisca-played-player">
              {gs.playerPlayed ? (
                <img
                  src={cardImg(gs.playerPlayed)}
                  alt={gs.playerPlayed.name}
                  className="brisca-card brisca-card-played"
                  onError={e => { (e.target as HTMLImageElement).src = fallbackImg(gs.playerPlayed!); }}
                />
              ) : <div className="brisca-empty-slot" />}
            </div>
          </div>

          {/* Player hand */}
          <div className="brisca-player-area">
            <div className="brisca-hand brisca-hand-player">
              {gs.playerHand.map((card, i) => (
                <img
                  key={i}
                  src={cardImg(card)}
                  alt={card.name}
                  className={[
                    'brisca-card',
                    canPlay ? 'brisca-card-clickable' : '',
                    card.suit === gs.trumpSuit ? 'brisca-card-trump' : '',
                  ].join(' ')}
                  onClick={() => canPlay && handleCardClick(i)}
                  onError={e => { (e.target as HTMLImageElement).src = fallbackImg(card); }}
                  title={`${card.name}${card.suit === gs.trumpSuit ? ' · TRIUNFO' : ''} · ${cardPts(card)}pts`}
                />
              ))}
            </div>
            <div className="brisca-area-name brisca-you-label">
              {gs.subPhase === 'player-lead' && 'Tú líderas — elige una carta'}
              {gs.subPhase === 'player-respond' && 'Responde al dealer'}
              {gs.subPhase === 'trick-resolution' && 'Resolviendo baza...'}
              {gs.subPhase === 'computer-lead' && 'El dealer está pensando...'}
              {gs.subPhase === 'game-over' && 'Partida terminada'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BriscaScreen;
