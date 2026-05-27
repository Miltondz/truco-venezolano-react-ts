import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BaseScreenProps, AICharacter, Card, DECKS, BOARDS } from '../types';
import { AvatarMood, getAvatarImagePath, getSmartFallbackPath } from '../utils/avatarMoods';
import { getActiveAICharacters } from '../data/aiCharacters';
import {
  shuffleChinchonDeck, chinchonCardValue, findBestMeldPartition,
  deadwoodPoints, aiSelectDiscard, aiShouldDrawDiscard, aiShouldClose
} from '../utils/chinchonLogic';

type Phase =
  | 'draw'          // player must draw (from deck or discard)
  | 'discard'       // player must discard
  | 'ai-turn'       // AI doing its thing
  | 'round-result'  // show result, allow next round
  | 'game-over';    // someone hit score limit

interface ChinchonState {
  deck: Card[];
  discardPile: Card[];
  playerHand: Card[];
  aiHand: Card[];
  phase: Phase;
  drawnCard: Card | null;    // card just drawn, shown highlighted
  closedBy: 'player' | 'ai' | null;
  roundMsg: string;
  playerTotal: number;       // accumulated penalty points
  aiTotal: number;
  roundsPlayed: number;
  isProcessing: boolean;
}

const SCORE_LIMIT = 100;
const AI_DELAY = 900;

function deal(): Pick<ChinchonState, 'deck' | 'discardPile' | 'playerHand' | 'aiHand'> {
  const shuffled = shuffleChinchonDeck();
  const playerHand = shuffled.slice(0, 7);
  const aiHand = shuffled.slice(7, 14);
  const firstDiscard = shuffled[14];
  const deck = shuffled.slice(15);
  return { deck, discardPile: [firstDiscard], playerHand, aiHand };
}

const CHINCHON_TUTORIAL_KEY = 'chinchon-tutorial-seen';

const ChinchonScreen: React.FC<BaseScreenProps> = ({ onNavigate }) => {
  const [showTutorial, setShowTutorial] = useState(() => localStorage.getItem(CHINCHON_TUTORIAL_KEY) !== 'true');
  const dismissTutorial = (permanent: boolean) => {
    if (permanent) localStorage.setItem(CHINCHON_TUTORIAL_KEY, 'true');
    setShowTutorial(false);
  };

  const [setupDone, setSetupDone] = useState(false);
  const [setupTab, setSetupTab] = useState<'baraja' | 'mesa' | 'oponente'>('baraja');
  const [selectedDeck, setSelectedDeck] = useState('default');
  const [selectedBoard, setSelectedBoard] = useState('tablero-mesa.jpg');
  const [opponent, setOpponent] = useState<AICharacter | null>(null);
  const [opponents] = useState(() => getActiveAICharacters());
  const [aiMood, setAiMood] = useState<AvatarMood>('default');
  const [playerMood, setPlayerMood] = useState<AvatarMood>('default');

  const [gs, setGs] = useState<ChinchonState>({
    deck: [], discardPile: [], playerHand: [], aiHand: [],
    phase: 'draw', drawnCard: null, closedBy: null, roundMsg: '',
    playerTotal: 0, aiTotal: 0, roundsPlayed: 0, isProcessing: false,
  });

  const gsRef = useRef(gs);
  gsRef.current = gs;
  const opponentRef = useRef(opponent);
  opponentRef.current = opponent;

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  useEffect(() => { if (opponents.length > 0 && !opponent) setOpponent(opponents[0]); }, [opponents, opponent]);
  useEffect(() => () => clearTimers(), []);

  // ── Start / new round ────────────────────────────────────────────────────

  const startRound = useCallback((prevPlayerTotal = 0, prevAiTotal = 0, prevRounds = 0) => {
    clearTimers();
    const dealt = deal();
    setGs({
      ...dealt,
      phase: 'draw',
      drawnCard: null,
      closedBy: null,
      roundMsg: '',
      playerTotal: prevPlayerTotal,
      aiTotal: prevAiTotal,
      roundsPlayed: prevRounds + 1,
      isProcessing: false,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetupStart = () => {
    if (!opponent) return;
    setSetupDone(true);
    startRound();
  };

  // ── Resolve round end ─────────────────────────────────────────────────────

  const resolveRound = useCallback((
    state: ChinchonState,
    closedBy: 'player' | 'ai',
    closerHand: Card[],
    otherHand: Card[]
  ) => {
    const melds = findBestMeldPartition(closerHand) ?? [];
    const closerDw = deadwoodPoints(closerHand, melds);
    const otherMelds = findBestMeldPartition(otherHand) ?? [];
    const otherDw = deadwoodPoints(otherHand, otherMelds);

    const chinchon = closerDw === 0 && closerHand.length === 7;
    let closerPenalty = 0;
    let otherPenalty = otherDw;

    if (chinchon) {
      closerPenalty = -10; // bonus for Chinchón
    } else if (closerDw > 0) {
      closerPenalty = closerDw; // failed close — own penalty
    }

    let newPlayerTotal = state.playerTotal;
    let newAiTotal = state.aiTotal;
    let msg = '';

    if (closedBy === 'player') {
      newPlayerTotal += closerPenalty;
      newAiTotal += otherPenalty;
      msg = chinchon
        ? `¡CHINCHÓN! -10 pts para ti, +${otherPenalty} para el dealer`
        : closerPenalty === 0
          ? `¡Cerré limpio! +${otherPenalty} pts para el dealer`
          : `Cerré con ${closerPenalty} pts. El dealer tiene ${otherPenalty} pts`;
    } else {
      newAiTotal += closerPenalty;
      newPlayerTotal += otherPenalty;
      msg = chinchon
        ? `El dealer hizo Chinchón. +${otherPenalty} pts de penalización`
        : closerPenalty === 0
          ? `El dealer cerró limpio. +${otherPenalty} pts de penalización`
          : `El dealer cerró con ${closerPenalty} pts. Tú tienes ${otherPenalty} pts`;
    }

    const gameOver = newPlayerTotal >= SCORE_LIMIT || newAiTotal >= SCORE_LIMIT;

    setGs(prev => ({
      ...prev,
      playerTotal: newPlayerTotal,
      aiTotal: newAiTotal,
      phase: gameOver ? 'game-over' : 'round-result',
      closedBy,
      roundMsg: gameOver
        ? (newPlayerTotal < newAiTotal ? '¡Ganaste la partida!' : 'El dealer gana la partida')
        : msg,
      isProcessing: false,
    }));
  }, []);

  // ── AI turn ─────────────────────────────────────────────────────────────

  const runAiTurn = useCallback(() => {
    const state = gsRef.current;
    const opp = opponentRef.current;

    // Draw step
    const topDiscard = state.discardPile[state.discardPile.length - 1];
    let aiHand = [...state.aiHand];
    let deck = [...state.deck];
    let discardPile = [...state.discardPile];

    if (topDiscard && aiShouldDrawDiscard(aiHand, topDiscard, opp)) {
      // Draw from discard
      aiHand = [...aiHand, topDiscard];
      discardPile = discardPile.slice(0, -1);
    } else {
      // Draw from deck
      if (deck.length === 0) {
        // Deck exhausted — shuffle discard
        deck = [...discardPile.slice(0, -1)].reverse();
        discardPile = [discardPile[discardPile.length - 1]];
      }
      const [drawn, ...rest] = deck;
      deck = rest;
      aiHand = [...aiHand, drawn];
    }

    // Discard step
    const discardIdx = aiSelectDiscard(state.aiHand, aiHand[aiHand.length - 1], opp);
    const discarded = aiHand[discardIdx];
    aiHand = aiHand.filter((_, i) => i !== discardIdx);
    discardPile = [...discardPile, discarded];

    // Check close
    const shouldClose = aiShouldClose(aiHand, opp);

    setGs(prev => ({
      ...prev,
      deck,
      discardPile,
      aiHand,
      isProcessing: false,
      phase: shouldClose ? 'round-result' : 'draw',
    }));

    if (shouldClose) {
      later(() => {
        const s = gsRef.current;
        resolveRound(s, 'ai', s.aiHand, s.playerHand);
      }, 300);
    }
  }, [resolveRound]);

  useEffect(() => {
    if (gs.phase !== 'ai-turn' || gs.isProcessing) return;
    setGs(prev => ({ ...prev, isProcessing: true }));
    later(runAiTurn, AI_DELAY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gs.phase]);

  // ── Player actions ────────────────────────────────────────────────────────

  const handleDrawFromDeck = () => {
    if (gs.phase !== 'draw' || gs.isProcessing) return;
    let deck = [...gs.deck];
    let discardPile = [...gs.discardPile];

    if (deck.length === 0) {
      deck = [...discardPile.slice(0, -1)].reverse();
      discardPile = [discardPile[discardPile.length - 1]];
    }

    const [drawn, ...rest] = deck;
    setGs(prev => ({
      ...prev,
      deck: rest,
      discardPile,
      drawnCard: drawn,
      playerHand: [...prev.playerHand, drawn],
      phase: 'discard',
    }));
  };

  const handleDrawFromDiscard = () => {
    if (gs.phase !== 'draw' || gs.isProcessing || gs.discardPile.length === 0) return;
    const topCard = gs.discardPile[gs.discardPile.length - 1];
    setGs(prev => ({
      ...prev,
      discardPile: prev.discardPile.slice(0, -1),
      drawnCard: topCard,
      playerHand: [...prev.playerHand, topCard],
      phase: 'discard',
    }));
  };

  const handleDiscard = (cardIndex: number) => {
    if (gs.phase !== 'discard' || gs.isProcessing) return;
    const card = gs.playerHand[cardIndex];
    const newHand = gs.playerHand.filter((_, i) => i !== cardIndex);

    setGs(prev => ({
      ...prev,
      playerHand: newHand,
      discardPile: [...prev.discardPile, card],
      drawnCard: null,
      phase: 'ai-turn',
    }));
  };

  // ── Closing flag ──────────────────────────────────────────────────────────

  const [closePending, setClosePending] = useState(false);

  const handleToggleClose = () => {
    if (gs.phase !== 'discard') return;
    setClosePending(p => !p);
  };

  const handleDiscardAndMaybeClose = (cardIndex: number) => {
    if (gs.phase !== 'discard' || gs.isProcessing) return;
    const card = gs.playerHand[cardIndex];
    const newHand = gs.playerHand.filter((_, i) => i !== cardIndex);

    if (closePending) {
      // Close: evaluate now
      setClosePending(false);
      const discardPile = [...gs.discardPile, card];
      setGs(prev => ({
        ...prev,
        playerHand: newHand,
        discardPile,
        drawnCard: null,
        isProcessing: true,
        phase: 'round-result',
        roundMsg: 'Evaluando...',
      }));
      later(() => {
        const s = gsRef.current;
        resolveRound({ ...s, playerHand: newHand }, 'player', newHand, s.aiHand);
      }, 200);
    } else {
      handleDiscard(cardIndex);
    }
  };

  // ── Mood triggers ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (gs.phase !== 'round-result' && gs.phase !== 'game-over') return;
    if (!gs.closedBy) return;
    const playerClosed = gs.closedBy === 'player';
    let pMood: AvatarMood;
    let aMood: AvatarMood;
    if (gs.phase === 'game-over') {
      const playerWins = gs.roundMsg.includes('¡Ganaste');
      pMood = playerWins ? 'smug' : 'sad';
      aMood = playerWins ? 'sad' : 'smug';
    } else {
      const isChinchon = gs.roundMsg.includes('CHINCHÓN') || gs.roundMsg.includes('Chinchón');
      if (playerClosed) {
        pMood = isChinchon ? 'smug' : 'happy';
        aMood = 'sad';
      } else {
        pMood = 'sad';
        aMood = isChinchon ? 'smug' : 'happy';
      }
    }
    setPlayerMood(pMood);
    setAiMood(aMood);
    const t = setTimeout(() => { setPlayerMood('default'); setAiMood('default'); }, 5000);
    return () => clearTimeout(t);
  }, [gs.phase, gs.closedBy, gs.roundMsg]);

  const aiAvatarBase = opponent?.avatar.replace('-default.jpg', '.jpg') ?? 'avatar1.jpg';
  const aiAvatarSrc = getAvatarImagePath(aiAvatarBase, aiMood, false);
  const aiAvatarFallback = getSmartFallbackPath(aiAvatarBase, aiMood, false);
  const playerAvatarSrc = getAvatarImagePath('', playerMood, true);

  // ── Derived UI ──────────────────────────────────────────────────────────

  const playerMelds = findBestMeldPartition(gs.playerHand) ?? [];
  const playerDw = deadwoodPoints(gs.playerHand, playerMelds);
  const topDiscard = gs.discardPile[gs.discardPile.length - 1];
  const canClose = gs.phase === 'discard' && gs.playerHand.length === 8;

  const cardImg = (card: Card) => `/images/decks/${selectedDeck}/${card.imageFile}`;
  const fallbackImg = (card: Card) => `/images/decks/default/${card.imageFile}`;

  const cardInMeld = (card: Card): boolean =>
    playerMelds.some(m => m.cards.includes(card));

  return (
    <div id="chinchon-screen" className="screen active chinchon-screen">
      <button className="back-button" onClick={() => { clearTimers(); onNavigate('main-screen'); }}>← Volver</button>

      {showTutorial && (
        <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-label="Tutorial Chinchón">
          <div className="tutorial-card">
            <h3 className="tutorial-title">🃏 Cómo jugar Chinchón</h3>
            <ul className="tutorial-rules">
              <li>Objetivo: evitar acumular <strong>100 puntos</strong> (cartas sin mezclar penalizan)</li>
              <li><strong>Escalera:</strong> 3+ cartas del mismo palo en orden (ej: 1-2-3 de oros)</li>
              <li><strong>Trío/Cuarteto:</strong> 3-4 cartas del mismo valor en diferentes palos</li>
              <li>Roba del mazo o de la pila de descarte; luego descarta una carta</li>
              <li><strong>Cerrar:</strong> cuando tus 7 cartas formen melds completos sin sobrantes</li>
              <li><strong>Chinchón:</strong> escalera con las 7 cartas = <strong>-10 puntos</strong></li>
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
          <h2 className="game-title">🃏 Chinchón</h2>
          <p className="sm-subtitle">El rummy venezolano clásico — forma escaleras y tríos</p>
          <p className="sm-game-desc">Forma escaleras o grupos con tus 7 cartas. Cierra cuando tengas la combinación ganadora — gana quien acumule menos puntos.</p>

          {/* Mobile tab navigation */}
          <div className="sm-setup-tabs">
            <button className={`sm-tab-btn${setupTab === 'baraja' ? ' active' : ''}`} onClick={() => setSetupTab('baraja')}>🃏 Baraja</button>
            <button className={`sm-tab-btn${setupTab === 'mesa' ? ' active' : ''}`} onClick={() => setSetupTab('mesa')}>🟩 Mesa</button>
            <button className={`sm-tab-btn${setupTab === 'oponente' ? ' active' : ''}`} onClick={() => setSetupTab('oponente')}>👤 Oponente</button>
          </div>
          <div className="sm-setup-panel">
            {setupTab === 'baraja' && (
              <div className="sm-panel-grid-2">
                {DECKS.map(d => (
                  <div key={d} className={`sm-panel-item${selectedDeck === d ? ' selected' : ''}`} onClick={() => setSelectedDeck(d)}>
                    <img src={`/images/decks/${d}/deck-preview.jpg`} alt={d} className="sm-panel-img sm-panel-img-deck" />
                    <span className="sm-panel-item-name">{d}</span>
                  </div>
                ))}
              </div>
            )}
            {setupTab === 'mesa' && (
              <div className="sm-panel-grid-2">
                {BOARDS.map(b => (
                  <div key={b} className={`sm-panel-item${selectedBoard === b ? ' selected' : ''}`} onClick={() => setSelectedBoard(b)}>
                    <img src={`/images/backgrounds/${b}`} alt={b.replace('.jpg', '')} className="sm-panel-img sm-panel-img-board" />
                    <span className="sm-panel-item-name">{b.replace('tablero-', '').replace('.jpg', '')}</span>
                  </div>
                ))}
              </div>
            )}
            {setupTab === 'oponente' && (
              <div className="sm-opponent-list-panel">
                {opponents.map(op => (
                  <div key={op.id} className={`sm-opponent-card${opponent?.id === op.id ? ' selected' : ''}`} onClick={() => setOpponent(op)}>
                    <img src={`/images/avatars/${op.avatar}`} alt={op.name} className="sm-panel-avatar"
                      onError={e => { (e.target as HTMLImageElement).src = '/images/avatars/avatar1-default.jpg'; }} />
                    <div className="sm-opponent-info">
                      <span className="sm-opponent-name">{op.name}</span>
                      <span className="sm-opponent-diff">{op.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop layout (hidden on mobile via CSS) */}
          <div className="sm-setup-top-row">
            <div className="sm-setup-section">
              <h3 className="setup-title">Elige tu Baraja</h3>
              <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
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
            <div className="sm-setup-section">
              <h3 className="setup-title">Elige tu Mesa</h3>
              <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                {BOARDS.map(b => (
                  <div
                    key={b}
                    className={`selection-item ${selectedBoard === b ? 'selected' : ''}`}
                    onClick={() => setSelectedBoard(b)}
                  >
                    <img src={`/images/backgrounds/${b}`} alt={b.replace('.jpg', '')} />
                    <div className="item-name">{b.replace('tablero-', '').replace('.jpg', '')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sm-setup-section sm-setup-desktop-opponents">
            <h3 className="setup-title">Elige tu Oponente</h3>
            <div className="sm-opponent-list">
              {opponents.map(op => (
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
            Evita acumular <strong>{SCORE_LIMIT} puntos</strong>. Chinchón = -10 pts.
          </div>

          <button className="menu-button" onClick={handleSetupStart} disabled={!opponent}>
            🎮 Comenzar Juego
          </button>
        </div>
      )}

      {/* GAME */}
      {setupDone && (
        <div
          className="chinchon-game"
          style={{ backgroundImage: `url(/images/backgrounds/${selectedBoard})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          {/* Header */}
          <div className="chinchon-header">
            <span className="game-name-badge">🃏 Chinchón</span>
            <div className="chinchon-score-block">
              <span className="chinchon-score-name">{opponent?.name ?? 'Dealer'}</span>
              <span className="chinchon-score-pts">{gs.aiTotal}</span>
            </div>
            <div className="chinchon-round-info">
              <span className="chinchon-round-label">Ronda {gs.roundsPlayed}</span>
              <span className="chinchon-limit-label">límite {SCORE_LIMIT}</span>
            </div>
            <div className="chinchon-score-block chinchon-score-mine">
              <span className="chinchon-score-name">Tú</span>
              <span className="chinchon-score-pts">{gs.playerTotal}</span>
            </div>
          </div>

          {/* Opponent area */}
          <div className="chinchon-opponent-area">
            <div className="chinchon-avatar-row">
              {opponent && (
                <img
                  src={aiAvatarSrc}
                  alt={opponent.name}
                  className="chinchon-avatar"
                  onError={e => { (e.target as HTMLImageElement).src = aiAvatarFallback; }}
                />
              )}
              <span className="chinchon-area-label">{gs.aiHand.length} cartas</span>
            </div>
            <div className="chinchon-hand chinchon-hand-ai">
              {gs.aiHand.map((_, i) => (
                <div key={i} className="chinchon-card chinchon-card-back">
                  <div className="chinchon-card-back-inner" />
                </div>
              ))}
            </div>
          </div>

          {/* Draw zone (center) */}
          <div className="chinchon-draw-zone">
            {/* Deck */}
            <div
              className={`chinchon-deck-pile ${gs.phase === 'draw' && !gs.isProcessing ? 'chinchon-pile-active' : ''}`}
              onClick={handleDrawFromDeck}
              title="Robar del mazo"
            >
              <div className="chinchon-card chinchon-card-back chinchon-deck-card">
                <div className="chinchon-card-back-inner" />
              </div>
              <span className="chinchon-pile-label">{gs.deck.length} cartas</span>
            </div>

            {/* Center info */}
            <div className="chinchon-center-info">
              <div className="chinchon-phase-msg">
                {gs.phase === 'draw' && !gs.isProcessing && 'Roba del mazo o descarte'}
                {gs.phase === 'discard' && !closePending && 'Descarta una carta'}
                {gs.phase === 'discard' && closePending && '¡Cerrando! Elige qué descartar'}
                {gs.phase === 'ai-turn' && 'El dealer juega...'}
                {(gs.phase === 'round-result' || gs.phase === 'game-over') && gs.roundMsg}
              </div>
              {gs.playerHand.length === 7 && gs.phase === 'draw' && (
                <div className="chinchon-dw-hint">
                  Puntos muertos: <strong>{playerDw}</strong>
                </div>
              )}
            </div>

            {/* Discard pile */}
            <div
              className={`chinchon-discard-pile ${gs.phase === 'draw' && !gs.isProcessing && topDiscard ? 'chinchon-pile-active' : ''}`}
              onClick={handleDrawFromDiscard}
              title="Robar del descarte"
            >
              {topDiscard ? (
                <img
                  src={cardImg(topDiscard)}
                  alt={topDiscard.name}
                  className="chinchon-card"
                  onError={e => { (e.target as HTMLImageElement).src = fallbackImg(topDiscard); }}
                />
              ) : (
                <div className="chinchon-card chinchon-empty-discard" />
              )}
              <span className="chinchon-pile-label">Descarte</span>
            </div>
          </div>

          {/* Player hand */}
          <div className="chinchon-player-area">
            <div className="chinchon-avatar-row">
              <img
                src={playerAvatarSrc}
                alt="Tú"
                className="chinchon-avatar"
                onError={e => { (e.target as HTMLImageElement).src = '/images/avatars/player-default.jpg'; }}
              />
              <span className="chinchon-area-label">Tú</span>
            </div>
            <div className="chinchon-hand chinchon-hand-player">
              {gs.playerHand.map((card, i) => (
                <div key={i} className="chinchon-card-wrap">
                  <img
                    src={cardImg(card)}
                    alt={card.name}
                    className={[
                      'chinchon-card',
                      gs.phase === 'discard' && !gs.isProcessing ? 'chinchon-card-selectable' : '',
                      card === gs.drawnCard ? 'chinchon-card-drawn' : '',
                      cardInMeld(card) ? 'chinchon-card-meld' : '',
                    ].join(' ')}
                    onClick={() => gs.phase === 'discard' && !gs.isProcessing && handleDiscardAndMaybeClose(i)}
                    onError={e => { (e.target as HTMLImageElement).src = fallbackImg(card); }}
                    title={`${card.name} · ${chinchonCardValue(card)}pts`}
                  />
                  {cardInMeld(card) && <div className="chinchon-meld-dot" />}
                </div>
              ))}
            </div>

            {/* Controls row */}
            <div className="chinchon-controls">
              {canClose && (
                <button
                  className={`chinchon-close-btn ${closePending ? 'chinchon-close-active' : ''}`}
                  onClick={handleToggleClose}
                >
                  {closePending ? '↩ Cancelar Cierre' : '🏁 Cerrar'}
                </button>
              )}
              <span className="chinchon-dw-label">
                {gs.phase === 'discard' && `Puntos muertos: ${playerDw}`}
                {gs.phase === 'draw' && 'Tu turno — roba'}
              </span>
            </div>
          </div>

          {/* Round result / game over actions */}
          {(gs.phase === 'round-result' || gs.phase === 'game-over') && (
            <div className="chinchon-result-bar">
              {gs.phase === 'round-result' && (
                <button
                  className="menu-button"
                  onClick={() => startRound(gs.playerTotal, gs.aiTotal, gs.roundsPlayed)}
                >
                  🔄 Nueva Ronda
                </button>
              )}
              {gs.phase === 'game-over' && (
                <>
                  <button className="menu-button" onClick={() => startRound()}>
                    🔄 Nueva Partida
                  </button>
                  <button
                    className="menu-button"
                    style={{ background: 'var(--accent-bg)' }}
                    onClick={() => onNavigate('main-screen')}
                  >
                    🏠 Menú
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChinchonScreen;
