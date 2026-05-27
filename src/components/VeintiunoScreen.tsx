import React, { useState, useEffect, useCallback } from 'react';
import { BaseScreenProps, AICharacter, Card, DECKS, BOARDS } from '../types';
import { AvatarMood, getAvatarImagePath, getSmartFallbackPath } from '../utils/avatarMoods';
import { getActiveAICharacters } from '../data/aiCharacters';
import {
  handTotal, isBust, isBlackjack, shuffleV21Deck, dealCard,
  dealerShouldDraw, evaluateResult, chipsDelta,
  getResultLabel, getResultMessage, V21Result
} from '../utils/veintiunoLogic';

type Phase = 'setup' | 'betting' | 'player-turn' | 'dealer-turn' | 'result' | 'gameover';

const INITIAL_CHIPS = 1000;
const MIN_BET = 50;
const MAX_BET = 500;
const BET_STEP = 50;

interface V21GameState {
  deck: Card[];
  playerHand: Card[];
  dealerHand: Card[];
  dealerVisible: boolean;
  doubled: boolean;
  result: V21Result | null;
}

const V21_TUTORIAL_KEY = 'v21-tutorial-seen';

const VeintiunoScreen: React.FC<BaseScreenProps> = ({ onNavigate }) => {
  const [showTutorial, setShowTutorial] = useState(
    () => localStorage.getItem(V21_TUTORIAL_KEY) !== 'true'
  );
  const dismissTutorial = (permanent: boolean) => {
    if (permanent) localStorage.setItem(V21_TUTORIAL_KEY, 'true');
    setShowTutorial(false);
  };

  const [selectedDeck, setSelectedDeck] = useState('default');
  const [selectedBoard, setSelectedBoard] = useState('tablero-mesa.jpg');
  const [opponent, setOpponent] = useState<AICharacter | null>(null);
  const [opponents] = useState<AICharacter[]>(() => getActiveAICharacters());

  const [chips, setChips] = useState(INITIAL_CHIPS);
  const [currentBet, setCurrentBet] = useState(MIN_BET);
  const [roundsWon, setRoundsWon] = useState(0);
  const [roundsLost, setRoundsLost] = useState(0);

  const [phase, setPhase] = useState<Phase>('setup');
  const [isProcessing, setIsProcessing] = useState(false);

  const [aiMood, setAiMood] = useState<AvatarMood>('default');
  const [playerMood, setPlayerMood] = useState<AvatarMood>('default');
  const [showBlackjackFlash, setShowBlackjackFlash] = useState(false);

  const [gs, setGs] = useState<V21GameState>({
    deck: [],
    playerHand: [],
    dealerHand: [],
    dealerVisible: false,
    doubled: false,
    result: null,
  });

  const [resultMsg, setResultMsg] = useState('');

  useEffect(() => {
    if (opponents.length > 0 && !opponent) setOpponent(opponents[0]);
  }, [opponents, opponent]);

  const dealRound = useCallback(() => {
    if (chips < MIN_BET) { setPhase('gameover'); return; }
    const newDeck = shuffleV21Deck();
    const { card: p1, remaining: r1 } = dealCard(newDeck);
    const { card: d1, remaining: r2 } = dealCard(r1);
    const { card: p2, remaining: r3 } = dealCard(r2);
    const { card: d2, remaining: r4 } = dealCard(r3);

    const pHand = [p1, p2];
    const dHand = [d1, d2];

    setGs({
      deck: r4,
      playerHand: pHand,
      dealerHand: dHand,
      dealerVisible: false,
      doubled: false,
      result: null,
    });
    setResultMsg('');
    setShowBlackjackFlash(false);
    setIsProcessing(false);

    const playerBJ = isBlackjack(pHand);
    const dealerBJ = isBlackjack(dHand);

    if (playerBJ || dealerBJ) {
      setIsProcessing(true);
      setTimeout(() => {
        const r = evaluateResult(pHand, dHand);
        const delta = chipsDelta(currentBet, false, r);
        setGs(prev => ({ ...prev, dealerVisible: true, result: r }));
        setResultMsg(getResultMessage(r, currentBet, false));
        setChips(c => c + delta);
        if (delta > 0) { setRoundsWon(p => p + 1); }
        else if (delta < 0) { setRoundsLost(p => p + 1); }
        if (playerBJ) setShowBlackjackFlash(true);
        setPhase('result');
        setIsProcessing(false);
      }, 800);
    } else {
      setPhase('player-turn');
    }
  }, [chips, currentBet]);

  const runDealerTurn = useCallback((
    pHand: Card[],
    initialDealerHand: Card[],
    currentDeck: Card[],
    bet: number,
    isDoubled: boolean,
    chipsSnapshot: number
  ) => {
    let dh = [...initialDealerHand];
    let dk = [...currentDeck];

    while (dk.length > 0 && !isBust(handTotal(dh).total)) {
      if (!dealerShouldDraw(handTotal(dh))) break;
      const { card, remaining } = dealCard(dk);
      dh = [...dh, card];
      dk = remaining;
    }

    let delay = 800;
    for (let i = 2; i < dh.length; i++) {
      const snapshot = dh.slice(0, i + 1);
      setTimeout(() => {
        setGs(prev => ({ ...prev, dealerHand: snapshot }));
      }, delay);
      delay += 650;
    }

    setTimeout(() => {
      const r = evaluateResult(pHand, dh);
      const delta = chipsDelta(bet, isDoubled, r);
      setGs(prev => ({ ...prev, result: r, dealerHand: dh }));
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
    runDealerTurn(pHand, dHand, deck, currentBet, doubled, chips);
  }, [chips, currentBet, runDealerTurn]);

  const handleStartGame = () => {
    if (!opponent) return;
    setChips(INITIAL_CHIPS);
    setCurrentBet(MIN_BET);
    setRoundsWon(0);
    setRoundsLost(0);
    setPhase('betting');
  };

  const handleConfirmBet = () => { dealRound(); };

  const handleHit = () => {
    if (isProcessing || phase !== 'player-turn' || gs.deck.length === 0) return;
    const { card, remaining } = dealCard(gs.deck);
    const newHand = [...gs.playerHand, card];
    const { total: newTotal } = handTotal(newHand);

    setGs(prev => ({ ...prev, playerHand: newHand, deck: remaining }));

    if (isBust(newTotal)) {
      setIsProcessing(true);
      setGs(prev => ({ ...prev, dealerVisible: true }));
      const r: V21Result = 'player-bust';
      const delta = chipsDelta(currentBet, gs.doubled, r);
      setTimeout(() => {
        setGs(prev => ({ ...prev, result: r }));
        setResultMsg(getResultMessage(r, currentBet, gs.doubled));
        setChips(chips + delta);
        setRoundsLost(p => p + 1);
        setPhase('result');
        setIsProcessing(false);
      }, 500);
    } else if (newTotal === 21) {
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
    if (currentBet * 2 > chips || gs.deck.length === 0) return;

    const { card, remaining } = dealCard(gs.deck);
    const newHand = [...gs.playerHand, card];
    const { total: newTotal } = handTotal(newHand);

    setGs(prev => ({ ...prev, playerHand: newHand, deck: remaining, doubled: true }));
    setIsProcessing(true);

    if (isBust(newTotal)) {
      setGs(prev => ({ ...prev, dealerVisible: true }));
      const r: V21Result = 'player-bust';
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
    setGs(prev => ({ ...prev, playerHand: [], dealerHand: [], result: null, doubled: false, dealerVisible: false }));
    setResultMsg('');
    setShowBlackjackFlash(false);
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

  useEffect(() => {
    if (phase !== 'result' || !gs.result) return;
    let pMood: AvatarMood = 'default';
    let aMood: AvatarMood = 'default';
    switch (gs.result) {
      case 'player-blackjack': pMood = 'smug'; aMood = 'sad'; break;
      case 'dealer-blackjack': pMood = 'sad'; aMood = 'smug'; break;
      case 'both-blackjack':   break;
      case 'player-win':
      case 'dealer-bust':      pMood = 'happy'; aMood = 'sad'; break;
      case 'dealer-win':
      case 'player-bust':      pMood = 'sad'; aMood = 'happy'; break;
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

  const canDouble = phase === 'player-turn' && !gs.doubled && currentBet * 2 <= chips && !isProcessing && gs.playerHand.length === 2;
  const canHit = phase === 'player-turn' && !isProcessing;
  const canStand = phase === 'player-turn' && !isProcessing;

  const playerTotal = handTotal(gs.playerHand);
  const dealerVisibleTotal = gs.dealerVisible
    ? handTotal(gs.dealerHand).total
    : gs.dealerHand.length > 0
      ? handTotal([gs.dealerHand[0]]).total
      : 0;

  const resultIsWin = gs.result === 'player-win' || gs.result === 'player-blackjack' || gs.result === 'dealer-bust';
  const resultIsLose = gs.result === 'player-bust' || gs.result === 'dealer-win' || gs.result === 'dealer-blackjack';

  return (
    <div id="veintiuno-screen" className="screen active sm-screen">
      <button className="back-button" onClick={() => onNavigate('main-screen')}>← Volver</button>

      {showTutorial && (
        <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-label="Tutorial Veintiuno">
          <div className="tutorial-card">
            <h3 className="tutorial-title">🂡 Cómo jugar Veintiuno (21)</h3>
            <ul className="tutorial-rules">
              <li>Objetivo: llega a <strong>21</strong> o acércate sin pasarte</li>
              <li>As vale <strong>1 u 11</strong> (automático); figuras valen <strong>10</strong></li>
              <li><strong>Pedir:</strong> toma una carta más del mazo</li>
              <li><strong>Plantarse:</strong> el dealer para en 17 o más</li>
              <li><strong>Doblar:</strong> dobla la apuesta y recibes exactamente una carta más</li>
              <li>Blackjack (21 con 2 cartas) paga <strong>3:2</strong> sobre tu apuesta</li>
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
          <h2 className="game-title v21-accent-text">🂡 Veintiuno</h2>
          <p className="sm-subtitle">El clásico Blackjack con cartas españolas</p>

          <div className="sm-setup-top-row">
            <div className="sm-setup-section">
              <h3 className="setup-title">Elige tu Baraja</h3>
              <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                {DECKS.map(d => (
                  <div key={d} className={`selection-item ${selectedDeck === d ? 'selected' : ''}`} onClick={() => setSelectedDeck(d)}>
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
                  <div key={b} className={`selection-item ${selectedBoard === b ? 'selected' : ''}`} onClick={() => setSelectedBoard(b)}>
                    <img src={`/images/backgrounds/${b}`} alt={b.replace('.jpg', '')} />
                    <div className="item-name">{b.replace('tablero-', '').replace('.jpg', '')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sm-setup-section">
            <h3 className="setup-title">Elige tu Oponente</h3>
            <div className="sm-opponent-list">
              {opponents.map(op => (
                <div key={op.id} className={`sm-opponent-card ${opponent?.id === op.id ? 'selected' : ''}`} onClick={() => setOpponent(op)}>
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

          <button className="menu-button v21-btn" onClick={handleStartGame} disabled={!opponent}>
            🎮 Comenzar Juego
          </button>
        </div>
      )}

      {phase !== 'setup' && (
        <div
          className="sm-game-container"
          style={{ backgroundImage: `url(/images/backgrounds/${selectedBoard})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          {showBlackjackFlash && (
            <div className="v21-blackjack-flash" onAnimationEnd={() => setShowBlackjackFlash(false)}>
              🂡 ¡BLACKJACK!
            </div>
          )}

          {/* Header */}
          <div className="sm-header v21-header">
            <span className="game-name-badge v21-badge">🂡 Veintiuno</span>
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
                  {i === 1 && !gs.dealerVisible ? (
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
                {dealerVisibleTotal > 0 ? dealerVisibleTotal : '?'}
              </div>
            </div>
          </div>

          <div className="sm-divider" />

          {/* Player area */}
          <div className="sm-player-area">
            <div className="sm-total-wrapper">
              <span className="sm-total-label">
                Puntos{playerTotal.soft && gs.playerHand.length > 0 ? ' ♦' : ''}
              </span>
              <div className={`sm-total ${playerTotal.total === 21 ? 'v21-total-21' : ''} ${isBust(playerTotal.total) ? 'sm-total-bust' : ''}`}>
                {gs.playerHand.length > 0 ? playerTotal.total : ''}
              </div>
            </div>
            <div className="sm-cards">
              {gs.playerHand.map((card, i) => (
                <img
                  key={i}
                  src={`/images/decks/${selectedDeck}/${card.imageFile}`}
                  alt={card.name}
                  className={`sm-card ${phase === 'result' && resultIsWin ? 'sm-card-win' : ''} ${phase === 'result' && resultIsLose ? 'sm-card-lose' : ''}`}
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

          {/* Betting */}
          {phase === 'betting' && (
            <div className="sm-betting">
              <h3 className="sm-phase-title">Coloca tu Apuesta</h3>
              <div className="sm-bet-controls">
                <button className="sm-bet-btn v21-bet-btn" onClick={() => setCurrentBet(b => Math.max(MIN_BET, b - BET_STEP))} disabled={currentBet <= MIN_BET}>−</button>
                <div className="sm-bet-display">
                  <span className="sm-bet-amount">{currentBet}</span>
                  <span className="sm-bet-label">fichas</span>
                </div>
                <button className="sm-bet-btn v21-bet-btn" onClick={() => setCurrentBet(b => Math.min(Math.min(MAX_BET, chips), b + BET_STEP))} disabled={currentBet >= Math.min(MAX_BET, chips)}>+</button>
              </div>
              <div className="sm-bet-presets">
                {[50, 100, 200, 500].filter(v => v <= chips).map(v => (
                  <button key={v} className={`sm-preset-btn v21-preset-btn ${currentBet === v ? 'active' : ''}`} onClick={() => setCurrentBet(v)}>{v}</button>
                ))}
                <button className="sm-preset-btn v21-preset-btn" onClick={() => setCurrentBet(chips)}>Todo</button>
              </div>
              <button className="menu-button v21-btn" onClick={handleConfirmBet}>🃏 Repartir Cartas</button>
            </div>
          )}

          {/* Actions */}
          {(phase === 'player-turn' || phase === 'dealer-turn') && (
            <div className="sm-actions">
              {phase === 'dealer-turn' && <div className="sm-dealer-thinking">El dealer está jugando...</div>}
              {phase === 'player-turn' && (
                <>
                  <button className="sm-action-btn sm-hit" onClick={handleHit} disabled={!canHit}>🃏 Pedir</button>
                  <button className="sm-action-btn sm-stand" onClick={handleStand} disabled={!canStand}>✋ Plantarse</button>
                  <button
                    className={`sm-action-btn sm-double ${!canDouble ? 'disabled' : ''}`}
                    onClick={handleDouble}
                    disabled={!canDouble}
                    title={
                      currentBet * 2 > chips
                        ? 'No tienes fichas suficientes'
                        : gs.playerHand.length !== 2
                          ? 'Solo en primera jugada'
                          : 'Doblar apuesta, recibir una carta más'
                    }
                  >
                    ✕2 Doblar
                  </button>
                </>
              )}
            </div>
          )}

          {/* Result */}
          {phase === 'result' && gs.result && (
            <div className={`sm-result ${resultIsWin ? 'sm-result-win' : resultIsLose ? 'sm-result-lose' : 'sm-result-tie'} ${gs.result === 'player-blackjack' ? 'v21-result-blackjack' : ''}`}>
              <div className="sm-result-label">{getResultLabel(gs.result)}</div>
              <div className="sm-result-msg">{resultMsg}</div>
              <div className="sm-result-actions">
                <button className="menu-button v21-btn" onClick={handleNextRound}>🔄 Nueva Ronda</button>
              </div>
            </div>
          )}

          {/* Game over */}
          {phase === 'gameover' && (
            <div className="sm-result sm-result-lose">
              <div className="sm-result-label">¡Sin Fichas!</div>
              <div className="sm-result-msg">Ganaste {roundsWon} y perdiste {roundsLost} rondas</div>
              <div className="sm-result-actions">
                <button className="menu-button v21-btn" onClick={handleReset}>🔄 Jugar de Nuevo</button>
                <button className="menu-button" style={{ background: 'var(--accent-bg)' }} onClick={() => onNavigate('main-screen')}>🏠 Menú Principal</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VeintiunoScreen;
