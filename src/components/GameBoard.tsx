import React, { useState, useEffect } from 'react';
import { GameBoardProps } from '../types';
import Card from './Card';
import AIPersonalityDisplay from './AIPersonalityDisplay';
import { getAvatarImagePath, resetAvatarsToDefault, getFallbackAvatarPath, getSmartFallbackPath } from '../utils/avatarMoods';

const GameBoard: React.FC<GameBoardProps> = ({
  onNavigate,
  gameState,
  setGameState,
  gameSettings,
  onPlayCard,
  onCallTruco,
  onCallRetruco,
  onCallVale4,
  onCallEnvido,
  onAcceptCall,
  onRejectCall,
  onCallFlor,
  onFoldHand,
  onCallValeNueve,
  onCallValeJuego,
  onCallRealEnvido,
  onCallFaltaEnvido,
  onCallEstarCantando
}) => {
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [avatarErrors, setAvatarErrors] = useState<{computer: boolean, player: boolean}>({computer: false, player: false});
  
  // Reset avatars to default at the beginning of each turn
  useEffect(() => {
    resetAvatarsToDefault(gameState, setGameState);
    setAvatarErrors({computer: false, player: false}); // Reset error states
  }, [gameState.isPlayerTurn, gameState.currentRound]);
  
  // Reset error states when moods change to allow new images to load
  useEffect(() => {
    setAvatarErrors({computer: false, player: false});
  }, [gameState.computerAvatarMood, gameState.playerAvatarMood]);
  
  // Handle avatar image loading errors
  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement>, isPlayer: boolean) => {
    const img = e.target as HTMLImageElement;
    const errorKey = isPlayer ? 'player' : 'computer';
    
    // Prevent infinite loop by checking if we already had an error
    if (!avatarErrors[errorKey]) {
      const mood = isPlayer ? gameState.playerAvatarMood : gameState.computerAvatarMood;
      const fallbackSrc = getSmartFallbackPath(gameState.selectedAvatar, mood, isPlayer);
      img.src = fallbackSrc;
      setAvatarErrors(prev => ({ ...prev, [errorKey]: true }));
    }
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleQuitGame = () => {
    onNavigate('main-screen');
  };

  const handleShowPersonality = () => {
    setShowPersonalityModal(true);
  };

  const handleClosePersonality = () => {
    setShowPersonalityModal(false);
  };

  const { agresividad, intimidacion, calculo, adaptabilidad, archetype } = gameState.aiPersonality;
  
  // Common disabled state for all interactive elements
  const isActionDisabled = gameState.waitingForResponse || gameState.isProcessingAction;

  return (
    <div id="game-board" className="game-board active" style={{ backgroundImage: `url('/images/backgrounds/${gameSettings.selectedBoard}')` }}>
      <div className="game-layout" style={{ touchAction: 'manipulation' }}>
        <div className="game-header">
          <button className="nav-button" onClick={handlePause}>⏸️ Pausa</button>
          <div className="game-status">
            <div className="turn-indicator">
              <span className="status-icon">🎯</span>
              <span className="status-text" id="turn-status">
                {gameState.waitingForResponse ? 'Esperando respuesta...' : gameState.isPlayerTurn ? 'Tu turno' : 'Turno de la computadora'}
              </span>
            </div>
            <div className="round-info" id="round-info">Ronda {gameState.currentRound} de {gameState.maxRounds}</div>
            <div className="active-calls" id="active-calls">
              {gameState.activeCalls.map((call, index) => (
                <div key={index} className="call-badge">{call}</div>
              ))}
            </div>
          </div>
          <div className="scoreboard">
            <div className="score-item">
              <div className="score-label">Jugador</div>
              <div className="score-value" id="player-score">{gameState.playerScore}</div>
            </div>
            <div className="score-item">
              <div className="score-label">Computadora</div>
              <div className="score-value" id="computer-score">{gameState.computerScore}</div>
            </div>
          </div>
        </div>

        <div className="game-area">
          <div className="computer-section">
            <div className="computer-info">
              <img 
                id="computer-avatar" 
                src={getAvatarImagePath(gameState.selectedAvatar, gameState.computerAvatarMood, false)} 
                alt="Avatar del Oponente" 
                className="avatar-image computer-avatar"
                onError={(e) => handleAvatarError(e, false)}
              />
            </div>
            <div className="computer-hand" id="computer-hand">
              {gameState.computerHand.map((_, index) => (
                <Card key={index} card={null} faceUp={false} settings={gameSettings} />
              ))}
            </div>
            {gameSettings.handStrengthIndicator && (
              <div className="hand-strength-meter" id="computer-hand-strength">
                <div className="hand-strength-fill" style={{ width: '0%' }}></div>
              </div>
            )}
          </div>

          {/* AI Thinking Indicator */}
          {gameSettings.showAiThinking && (
            <div className="ai-thinking" id="ai-thinking" style={{ opacity: gameState.isPlayerTurn ? 0 : 1 }}>
              Pensando...
            </div>
          )}

          {/* Personality Indicators */}
          <div className="personality-indicators">
            <div className="personality-indicator" onClick={handleShowPersonality} title="Ver personalidad completa">
              <div className="indicator-label">🤖 {archetype}</div>
              <div className="indicator-value">IA Personalizada</div>
              <div className="indicator-bar">
                <div
                  className="indicator-fill"
                  style={{
                    width: `${Math.max(agresividad, intimidacion, calculo, adaptabilidad) * 10}%`,
                    background: `linear-gradient(90deg,
                      ${agresividad >= 7 ? '#ef4444,' : ''}
                      ${intimidacion >= 7 ? '#f59e0b,' : ''}
                      ${calculo >= 7 ? '#10b981,' : ''}
                      ${adaptabilidad >= 7 ? '#3b82f6,' : ''}
                      var(--text-accent))`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="play-area">
            <div className="played-cards" id="played-cards">
              <div className="played-card-slot">
                <div className="card-label">Computadora</div>
                <div id="computer-played-card">
                  {gameState.computerPlayedCard && (
                    <Card card={gameState.computerPlayedCard} faceUp={true} settings={gameSettings} />
                  )}
                </div>
              </div>
              <div className="vs-indicator">VS</div>
              <div className="played-card-slot">
                <div className="card-label">Jugador</div>
                <div id="player-played-card">
                  {gameState.playerPlayedCard && (
                    <Card card={gameState.playerPlayedCard} faceUp={true} settings={gameSettings} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="player-section">
            <div className="player-info">
              <img 
                id="player-avatar" 
                src={getAvatarImagePath('avatar7.jpg', gameState.playerAvatarMood, true)} 
                alt="Tu Avatar" 
                className="avatar-image player-avatar"
                onError={(e) => handleAvatarError(e, true)}
              />
            </div>
            <div className="player-hand" id="player-hand">
              {gameState.playerHand.map((card, index) => (
                <Card
                  key={index}
                  card={card}
                  faceUp={true}
                  onClick={isActionDisabled ? undefined : () => onPlayCard(index)}
                  showPower={false}
                  settings={gameSettings}
                  className={isActionDisabled ? 'disabled' : ''}
                />
              ))}
            </div>
            {gameSettings.handStrengthIndicator && (
              <div className="hand-strength-meter" id="player-hand-strength">
                <div className="hand-strength-fill" style={{ width: '0%' }}></div>
              </div>
            )}
            <div className="action-buttons" id="action-buttons">
              <button
                className="action-button"
                id="envido-btn"
                onClick={onCallEnvido}
                disabled={gameState.currentEnvidoLevel !== 0 || isActionDisabled}
                style={{ display: gameState.currentEnvidoLevel === 0 && !isActionDisabled ? 'block' : 'none' }}
              >
                🎵 Envido
              </button>
              <button
                className="action-button"
                id="real-envido-btn"
                onClick={onCallRealEnvido}
                disabled={gameState.currentEnvidoLevel !== 1 || gameState.waitingForResponse}
                style={{ display: gameState.currentEnvidoLevel === 1 && !gameState.waitingForResponse ? 'block' : 'none' }}
              >
                🎶 Real Envido
              </button>
              <button
                className="action-button"
                id="falta-envido-btn"
                onClick={onCallFaltaEnvido}
                disabled={gameState.currentEnvidoLevel <= 2 || gameState.waitingForResponse}
                style={{ display: gameState.currentEnvidoLevel <= 2 && !gameState.waitingForResponse ? 'block' : 'none' }}
              >
                🎼 Falta Envido
              </button>
              <button
                className="action-button"
                id="truco-btn"
                onClick={onCallTruco}
                disabled={gameState.currentTrucoLevel !== 0 || gameState.waitingForResponse}
                style={{ display: gameState.currentTrucoLevel === 0 && !gameState.waitingForResponse ? 'block' : 'none' }}
              >
                ⚡ Truco
              </button>
              <button
                className="action-button"
                id="retruco-btn"
                onClick={onCallRetruco}
                disabled={gameState.currentTrucoLevel !== 1 || gameState.waitingForResponse}
                style={{ display: gameState.currentTrucoLevel === 1 && !gameState.waitingForResponse ? 'block' : 'none' }}
              >
                ⚡⚡ Retruco
              </button>
              <button
                className="action-button"
                id="vale4-btn"
                onClick={onCallVale4}
                disabled={gameState.currentTrucoLevel !== 2 || gameState.waitingForResponse}
                style={{ display: gameState.currentTrucoLevel === 2 && !gameState.waitingForResponse ? 'block' : 'none' }}
              >
                ⚡⚡⚡ Vale 4
              </button>
              <button
                className="action-button"
                id="vale-nueve-btn"
                onClick={onCallValeNueve}
                disabled={gameState.waitingForResponse}
                style={{ display: !gameState.waitingForResponse ? 'block' : 'none' }}
              >
                🎯 Vale Nueve
              </button>
              <button
                className="action-button"
                id="vale-juego-btn"
                onClick={onCallValeJuego}
                disabled={gameState.waitingForResponse}
                style={{ display: !gameState.waitingForResponse ? 'block' : 'none' }}
              >
                🎲 Vale Juego
              </button>
              <button
                className="action-button"
                id="flor-btn"
                onClick={onCallFlor}
                disabled={!gameState.playerHasFlor || gameState.waitingForResponse}
                style={{ display: gameState.playerHasFlor && !gameState.waitingForResponse ? 'block' : 'none' }}
              >
                🌸 Flor
              </button>
              <button
                className="action-button"
                id="quiero-btn"
                onClick={onAcceptCall}
                disabled={!gameState.waitingForResponse}
                style={{ display: gameState.waitingForResponse ? 'block' : 'none' }}
              >
                ✅ Quiero
              </button>
              <button
                className="action-button"
                id="no-quiero-btn"
                onClick={onRejectCall}
                disabled={!gameState.waitingForResponse}
                style={{ display: gameState.waitingForResponse ? 'block' : 'none' }}
              >
                ❌ No Quiero
              </button>
              <button
                className="action-button"
                id="me-voy-btn"
                onClick={onFoldHand}
                disabled={gameState.waitingForResponse}
                style={{ display: !gameState.waitingForResponse ? 'block' : 'none' }}
              >
                🚪 Me Voy
              </button>
              <button
                className="action-button"
                id="estar-cantando-btn"
                onClick={onCallEstarCantando}
                disabled={gameState.playerScore !== 23 || gameState.waitingForResponse}
                style={{ display: gameState.playerScore === 23 && !gameState.waitingForResponse ? 'block' : 'none' }}
              >
                🎵 Estar Cantando
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Personality Modal */}
      <AIPersonalityDisplay
        personality={gameState.aiPersonality}
        isVisible={showPersonalityModal}
        onClose={handleClosePersonality}
      />

      {/* Pause Modal */}
      {isPaused && (
        <div className="modal active">
          <div className="modal-content">
            <h2 className="modal-title">Juego Pausado</h2>
            <p className="modal-text">¿Qué deseas hacer?</p>
            <div className="modal-buttons">
              <button className="modal-button primary" onClick={handleResume}>
                ▶️ Continuar Juego
              </button>
              <button className="modal-button" onClick={handleQuitGame}>
                🏠 Volver al Menú
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
