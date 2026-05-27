import React, { useState, useEffect, useCallback } from 'react';
import { BaseScreenProps, AICharacter, Card, DECKS, BOARDS } from '../types';
import { AvatarMood, getAvatarImagePath, getSmartFallbackPath } from '../utils/avatarMoods';
import { getActiveAICharacters } from '../data/aiCharacters';
import {
  cardSMValue, handTotal, isBust, shuffleSMDeck, dealCard,
  dealerShouldDraw, evaluateResult, chipsDelta, formatTotal,
  getResultLabel, getResultMessage, SMResult
} from '../utils/sieteMedioLogic';

type Phase = 'setup' | 'betting' | 'player-turn' | 'dealer-turn' | 'result' | 'gameover';

const INITIAL_CHIPS = 1000;
const MIN_BET = 50;
const MAX_BET = 500;
const BET_STEP = 50;

interface SMGameState {
  deck: Card[];
  playerHand: Card[];
  dealerHand: Card[];
  dealerVisible: boolean;
  playerTotal: number;
  dealerTotal: number;
  doubled: boolean;
  result: SMResult | null;
}

const SM_TUTORIAL_KEY = 'sm-tutorial-seen';

const SieteMedioScreen: React.FC<BaseScreenProps> = ({ onNavigate }) => {
  // Tutorial
  const [showTutorial, setShowTutorial] = useState(() => localStorage.getItem(SM_TUTORIAL_KEY) !== 'true');
  const dismissTutorial = (permanent: boolean) => {
    if (permanent) localStorage.setItem(SM_TUTORIAL_KEY, 'true');
    setShowTutorial(false);
  };

  // Setup
  const [selectedDeck, setSelectedDeck] = useState('default');
  const [selectedBoard, setSelectedBoard] = useState('tablero-mesa.jpg');
  const [opponent, setOpponent] = useState<AICharacter | null>(null);
  const [opponents] = useState<AICharacter[]>(() => getActiveAICharacters());

  // Economy
  const [chips, setChips] = useState(INITIAL_CHIPS);
  const [currentBet, setCurrentBet] = useState(MIN_BET);

  // Session stats
  const [roundsWon, setRoundsWon] = useState(0);
  const [roundsLost, setRoundsLost] = useState(0);

  // Phase
  const [setupTab, setSetupTab] = useState<'baraja' | 'mesa' | 'oponente'>('baraja');
  const [phase, setPhase] = useState<Phase>('setup');
  const [isProcessing, setIsProcessing] = useState(false);

  // Avatar moods
  const [aiMood, setAiMood] = useState<AvatarMood>('default');
  const [playerMood, setPlayerMood] = useState<AvatarMood>('default');

  // Game state
  const [gs, setGs] = useState<SMGameState>({
    deck: [],
    playerHand: [],
    dealerHand: [],
    dealerVisible: false,
    playerTotal: 0,
    dealerTotal: 0,
    doubled: false,
    result: null,
  });

  // Result message
  const [resultMsg, setResultMsg] = useState('');

  // Init default opponent
  useEffect(() => {
    if (opponents.length > 0 && !opponent) {
      setOpponent(opponents[0]);
    }
  }, [opponents, opponent]);

  const dealRound = useCallback(() => {
    if (chips < MIN_BET) {
      setPhase('gameover');
      return;
    }
    const newDeck = shuffleSMDeck();
    const { card: p1, remaining: r1 } = dealCard(newDeck);
    const { card: d1, remaining: r2 } = dealCard(r1);
    const { card: p2, remaining: r3 } = dealCard(r2);

    const pHand = [p1, p2];
    const dHand = [d1];
    const pTotal = handTotal(pHand);

    setGs({
      deck: r3,
      playerHand: pHand,
      dealerHand: dHand,
      dealerVisible: false,
      playerTotal: pTotal,
      dealerTotal: handTotal(dHand),
      doubled: false,
      result: null,
    });
    setResultMsg('');
    setIsProcessing(false);
    setPhase('player-turn');
  }, [chips]);

  const runDealerTurn = useCallback((
    pHand: Card[],
    initialDealerHand: Card[],
    currentDeck: Card[],
    bet: number,
    isDoubled: boolean,
    chipsSnapshot: number,
    opp: AICharacter | null
  ) => {
    // Pre-compute all dealer draws synchronously
    let dh = [...initialDealerHand];
    let dk = [...currentDeck];
    const pTotal = handTotal(pHand);

    while (dk.length > 0 && !isBust(handTotal(dh))) {
      if (!dealerShouldDraw(handTotal(dh), pTotal, opp, dk)) break;
      const { card, remaining } = dealCard(dk);
      dh = [...dh, card];
      dk = remaining;
    }

    // Animate reveals with successive timeouts
    let delay = 800;
    for (let i = 1; i < dh.length; i++) {
      const snapshot = dh.slice(0, i + 1);
      const total = handTotal(snapshot);
      setTimeout(() => {
        setGs(prev => ({ ...prev, dealerHand: snapshot, dealerTotal: total }));
      }, delay);
      delay += 650;
    }

    // Final result
    setTimeout(() => {
      const finalTotal = handTotal(dh);
      const r = evaluateResult(pTotal, finalTotal);
      const delta = chipsDelta(bet, isDoubled, r);

      setGs(prev => ({ ...prev, result: r, dealerTotal: finalTotal }));
      setResultMsg(getResultMessage(r, bet, isDoubled));
      setChips(chipsSnapshot + delta);
      if (delta > 0) setRoundsWon(p => p + 1);
      else if (delta < 0) setRoundsLost(p => p + 1);
      setPhase('result');
      setIsProcessing(false);
    }, delay + 300);
  }, []);

  const triggerStand = useCallback((
    pHand: Card[],
    dHand: Card[],
    deck: Card[],
    doubled: boolean
  ) => {
    setPhase('dealer-turn');
    setGs(prev => ({ ...prev, dealerVisible: true }));
    runDealerTurn(pHand, dHand, deck, currentBet, doubled, chips, opponent);
  }, [chips, currentBet, opponent, runDealerTurn]);

  // Actions
  const handleStartGame = () => {
    if (!opponent) return;
    setChips(INITIAL_CHIPS);
    setCurrentBet(MIN_BET);
    setRoundsWon(0);
    setRoundsLost(0);
    setPhase('betting');
  };

  const handleConfirmBet = () => {
    dealRound();
  };

  const handleHit = () => {
    if (isProcessing || phase !== 'player-turn' || gs.deck.length === 0) return;
    const { card, remaining } = dealCard(gs.deck);
    const newHand = [...gs.playerHand, card];
    const newTotal = handTotal(newHand);

    setGs(prev => ({
      ...prev,
      playerHand: newHand,
      playerTotal: newTotal,
      deck: remaining,
    }));

    if (isBust(newTotal)) {
      setIsProcessing(true);
      setGs(prev => ({ ...prev, dealerVisible: true }));
      const r: SMResult = 'player-bust';
      const delta = chipsDelta(currentBet, gs.doubled, r);
      setTimeout(() => {
        setGs(prev => ({ ...prev, result: r }));
        setResultMsg(getResultMessage(r, currentBet, gs.doubled));
        setChips(chips + delta);
        if (delta < 0) setRoundsLost(p => p + 1);
        setPhase('result');
        setIsProcessing(false);
      }, 500);
    } else if (newTotal === 7.5) {
      // Auto-stand on perfect siete
      setIsProcessing(true);
      setTimeout(() => {
        triggerStand(newHand, gs.dealerHand, remaining, gs.doubled);
      }, 400);
    }
  };

  const handleStand = () => {
    if (isProcessing || phase !== 'player-turn') return;
    setIsProcessing(true);
    triggerStand(gs.playerHand, gs.dealerHand, gs.deck, gs.doubled);
  };

  const handleDouble = () => {
    if (isProcessing || phase !== 'player-turn' || gs.doubled) return;
    if (currentBet * 2 > chips) return;
    if (gs.deck.length === 0) return;

    const { card, remaining } = dealCard(gs.deck);
    const newHand = [...gs.playerHand, card];
    const newTotal = handTotal(newHand);

    setGs(prev => ({
      ...prev,
      playerHand: newHand,
      playerTotal: newTotal,
      deck: remaining,
      doubled: true,
    }));

    setIsProcessing(true);

    if (isBust(newTotal)) {
      setGs(prev => ({ ...prev, dealerVisible: true }));
      const r: SMResult = 'player-bust';
      const delta = chipsDelta(currentBet, true, r);
      setTimeout(() => {
        setGs(prev => ({ ...prev, result: r }));
        setResultMsg(getResultMessage(r, currentBet, true));
        setChips(chips + delta);
        setRoundsLost(p => p + 1);
        setPhase('result');
        setIsProcessing(false);
      }, 500);
    } else {
      setTimeout(() => {
        triggerStand(newHand, gs.dealerHand, remaining, true);
      }, 400);
    }
  };

  const clearTable = () => {
    setGs(prev => ({ ...prev, playerHand: [], dealerHand: [], result: null, doubled: false, dealerVisible: false, playerTotal: 0, dealerTotal: 0 }));
    setResultMsg('');
    setIsProcessing(false);
  };

  const handleNextRound = () => {
    if (chips < MIN_BET) { setPhase('gameover'); return; }
    clearTable();
    setPhase('betting');
  };

  const handleReset = () => {
    clearTable();
    setChips(INITIAL_CHIPS);
    setCurrentBet(MIN_BET);
    setRoundsWon(0);
    setRoundsLost(0);
    setPhase('betting');
  };

  // Mood triggers
  useEffect(() => {
    if (phase !== 'result' || !gs.result) return;
    let pMood: AvatarMood = 'default';
    let aMood: AvatarMood = 'default';
    switch (gs.result) {
      case 'player-siete': pMood = 'smug'; aMood = 'sad'; break;
      case 'player-win':   pMood = 'happy'; aMood = 'sad'; break;
      case 'dealer-siete': pMood = 'sad'; aMood = 'smug'; break;
      case 'dealer-win':   pMood = 'sad'; aMood = 'happy'; break;
      case 'player-bust':  pMood = 'sad'; aMood = 'smug'; break;
    }
    setPlayerMood(pMood);
    setAiMood(aMood);
    const t = setTimeout(() => { setPlayerMood('default'); setAiMood('default'); }, 5000);
    return () => clearTimeout(t);
  }, [phase, gs.result]);

  useEffect(() => {
    if (phase === 'betting' || phase === 'setup') {
      setPlayerMood('default');
      setAiMood('default');
    }
  }, [phase]);

  const aiAvatarBase = opponent?.avatar.replace('-default.jpg', '.jpg') ?? 'avatar1.jpg';
  const aiAvatarSrc = getAvatarImagePath(aiAvatarBase, aiMood, false);
  const aiAvatarFallback = getSmartFallbackPath(aiAvatarBase, aiMood, false);
  const playerAvatarSrc = getAvatarImagePath('', playerMood, true);

  const canDouble = phase === 'player-turn' && !gs.doubled && currentBet * 2 <= chips && !isProcessing;
  const canHit = phase === 'player-turn' && !isProcessing;
  const canStand = phase === 'player-turn' && !isProcessing;

  const resultIsWin = gs.result === 'player-win' || gs.result === 'player-siete' || gs.result === 'dealer-bust';
  const resultIsLose = gs.result === 'player-bust' || gs.result === 'dealer-win' || gs.result === 'dealer-siete';

  return (
    <div id="siete-medio-screen" className="screen active sm-screen">
      <button className="back-button" onClick={() => onNavigate('main-screen')}>← Volver</button>

      {showTutorial && (
        <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-label="Tutorial Siete y Medio">
          <div className="tutorial-card">
            <h3 className="tutorial-title">🃏 Cómo jugar Siete y Medio</h3>
            <ul className="tutorial-rules">
              <li>Objetivo: llega a <strong>7½</strong> o acércate sin pasarte</li>
              <li>Figuras (J, Q, K) valen <strong>½ punto</strong>; números valen su valor</li>
              <li><strong>Pedir:</strong> toma una carta más del mazo</li>
              <li><strong>Plantarse:</strong> el dealer juega su turno</li>
              <li><strong>Doblar:</strong> dobla la apuesta y recibes exactamente una carta más</li>
              <li>7½ exacto paga <strong>2:1</strong> sobre tu apuesta</li>
            </ul>
            <div className="tutorial-actions">
              <button className="tutorial-btn-primary" onClick={() => dismissTutorial(false)}>Entendido</button>
              <button className="tutorial-btn-secondary" onClick={() => dismissTutorial(true)}>No mostrar más</button>
            </div>
          </div>
        </div>
      )}

      {phase === 'setup' && (
        <div className="sm-setup screen-content">
          <h2 className="game-title">🃏 Siete y Medio</h2>
          <p className="sm-subtitle">El clásico juego venezolano de cartas</p>
          <p className="sm-game-desc">Acércate a 7½ sin pasarte. Las figuras valen ½ punto. Decide si pedir carta o plantarte — gana quien esté más cerca del 7½.</p>

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
            <span>Fichas iniciales: </span>
            <strong>💰 {INITIAL_CHIPS}</strong>
          </div>

          <button
            className="menu-button"
            onClick={handleStartGame}
            disabled={!opponent}
          >
            🎮 Comenzar Juego
          </button>
        </div>
      )}

      {phase !== 'setup' && (
        <div
          className="sm-game-container"
          style={{ backgroundImage: `url(/images/backgrounds/${selectedBoard})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          {/* Header bar */}
          <div className="sm-header">
            <span className="game-name-badge">🃏 Siete y Medio</span>
            <div className="sm-stat">
              <span className="sm-stat-label">Fichas</span>
              <span className="sm-stat-value">💰 {chips}</span>
            </div>
            <div className="sm-stat">
              <span className="sm-stat-label">Apuesta</span>
              <span className="sm-stat-value">🎯 {gs.doubled ? currentBet * 2 : currentBet}</span>
            </div>
            <div className="sm-stat">
              <span className="sm-stat-label">Ganadas</span>
              <span className="sm-stat-value sm-wins">{roundsWon}</span>
            </div>
            <div className="sm-stat">
              <span className="sm-stat-label">Perdidas</span>
              <span className="sm-stat-value sm-losses">{roundsLost}</span>
            </div>
          </div>

          {/* Dealer area */}
          <div className="sm-dealer-area">
            <div className="sm-area-label">
              {opponent && (
                <img
                  src={aiAvatarSrc}
                  alt={opponent.name}
                  className="sm-avatar"
                  onError={e => { (e.target as HTMLImageElement).src = aiAvatarFallback; }}
                />
              )}
              <span>{opponent?.name ?? 'Dealer'}</span>
            </div>
            <div className="sm-cards">
              {gs.dealerHand.map((card, i) => (
                <div key={i} className="sm-card-wrapper">
                  {i === 0 && !gs.dealerVisible ? (
                    <div className="sm-card sm-card-back">
                      <div className="sm-card-back-inner" />
                    </div>
                  ) : (
                    <img
                      src={`/images/decks/${selectedDeck}/${card.imageFile}`}
                      alt={card.name}
                      className="sm-card"
                      onError={e => { (e.target as HTMLImageElement).src = `/images/decks/default/${card.imageFile}`; }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="sm-total-wrapper">
              <span className="sm-total-label">Puntos</span>
              <div className="sm-total">
                {gs.dealerVisible
                  ? formatTotal(gs.dealerTotal)
                  : gs.dealerHand.length > 1
                    ? `+ ${formatTotal(gs.dealerHand.slice(1).reduce((s, c) => s + cardSMValue(c), 0))}`
                    : '?'
                }
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="sm-divider" />

          {/* Player area */}
          <div className="sm-player-area">
            <div className="sm-total-wrapper">
              <span className="sm-total-label">Puntos</span>
              <div className={`sm-total ${gs.playerTotal === 7.5 ? 'sm-total-siete' : ''} ${isBust(gs.playerTotal) ? 'sm-total-bust' : ''}`}>
                {formatTotal(gs.playerTotal)}
              </div>
            </div>
            <div className="sm-cards">
              {gs.playerHand.map((card, i) => (
                <img
                  key={i}
                  src={`/images/decks/${selectedDeck}/${card.imageFile}`}
                  alt={card.name}
                  className={`sm-card ${phase === 'result' && gs.result && resultIsWin ? 'sm-card-win' : ''} ${phase === 'result' && gs.result && resultIsLose ? 'sm-card-lose' : ''}`}
                  onError={e => { (e.target as HTMLImageElement).src = `/images/decks/default/${card.imageFile}`; }}
                />
              ))}
            </div>
            <div className="sm-area-label">
              <img
                src={playerAvatarSrc}
                alt="Tú"
                className="sm-avatar"
                onError={e => { (e.target as HTMLImageElement).src = '/images/avatars/player-default.jpg'; }}
              />
              <span>Tú</span>
            </div>
          </div>

          {/* Betting phase */}
          {phase === 'betting' && (
            <div className="sm-betting">
              <h3 className="sm-phase-title">Coloca tu Apuesta</h3>
              <div className="sm-bet-controls">
                <button
                  className="sm-bet-btn"
                  onClick={() => setCurrentBet(b => Math.max(MIN_BET, b - BET_STEP))}
                  disabled={currentBet <= MIN_BET}
                >
                  −
                </button>
                <div className="sm-bet-display">
                  <span className="sm-bet-amount">{currentBet}</span>
                  <span className="sm-bet-label">fichas</span>
                </div>
                <button
                  className="sm-bet-btn"
                  onClick={() => setCurrentBet(b => Math.min(Math.min(MAX_BET, chips), b + BET_STEP))}
                  disabled={currentBet >= Math.min(MAX_BET, chips)}
                >
                  +
                </button>
              </div>
              <div className="sm-bet-presets">
                {[50, 100, 200, 500].filter(v => v <= chips).map(v => (
                  <button
                    key={v}
                    className={`sm-preset-btn ${currentBet === v ? 'active' : ''}`}
                    onClick={() => setCurrentBet(v)}
                  >
                    {v}
                  </button>
                ))}
                <button
                  className="sm-preset-btn"
                  onClick={() => setCurrentBet(chips)}
                >
                  Todo
                </button>
              </div>
              <button className="menu-button" onClick={handleConfirmBet}>
                🎴 Repartir Cartas
              </button>
            </div>
          )}

          {/* Player turn actions */}
          {(phase === 'player-turn' || phase === 'dealer-turn') && (
            <div className="sm-actions">
              {phase === 'dealer-turn' && (
                <div className="sm-dealer-thinking">El dealer está jugando...</div>
              )}
              {phase === 'player-turn' && (
                <>
                  <button
                    className="sm-action-btn sm-hit"
                    onClick={handleHit}
                    disabled={!canHit}
                  >
                    🃏 Pedir
                  </button>
                  <button
                    className="sm-action-btn sm-stand"
                    onClick={handleStand}
                    disabled={!canStand}
                  >
                    ✋ Plantarse
                  </button>
                  <button
                    className={`sm-action-btn sm-double ${!canDouble ? 'disabled' : ''}`}
                    onClick={handleDouble}
                    disabled={!canDouble}
                    title={currentBet * 2 > chips ? 'No tienes fichas suficientes' : 'Doblar apuesta, recibir una carta más'}
                  >
                    ✕2 Doblar
                  </button>
                </>
              )}
            </div>
          )}

          {/* Result */}
          {phase === 'result' && gs.result && (
            <div className={`sm-result ${resultIsWin ? 'sm-result-win' : resultIsLose ? 'sm-result-lose' : 'sm-result-tie'}`}>
              <div className="sm-result-label">{getResultLabel(gs.result)}</div>
              <div className="sm-result-msg">{resultMsg}</div>
              <div className="sm-result-actions">
                <button className="menu-button" onClick={handleNextRound}>
                  🔄 Nueva Ronda
                </button>
              </div>
            </div>
          )}

          {/* Game over */}
          {phase === 'gameover' && (
            <div className="sm-result sm-result-lose">
              <div className="sm-result-label">¡Sin Fichas!</div>
              <div className="sm-result-msg">
                Ganaste {roundsWon} y perdiste {roundsLost} rondas
              </div>
              <div className="sm-result-actions">
                <button className="menu-button" onClick={handleReset}>
                  🔄 Jugar de Nuevo
                </button>
                <button className="menu-button" style={{ background: 'var(--accent-bg)' }} onClick={() => onNavigate('main-screen')}>
                  🏠 Menú Principal
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SieteMedioScreen;
