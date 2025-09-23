import React from 'react';
import { GameBoardProps } from '../types';
import Card from './Card';

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
  onFoldHand
}) => {
  const handlePause = () => {
    onNavigate('pause-screen');
  };

  return (
    <div id="game-board" className="game-board active" style={{ backgroundImage: `url('/images/backgrounds/${gameSettings.selectedBoard}')` }}>
      <div className="game-layout">
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
              <img id="computer-avatar" src={`/images/avatars/${gameState.selectedAvatar}`} alt="Avatar del Oponente" className="avatar-image" />
              {gameSettings.showAiThinking && (
                <div className="ai-thinking" id="ai-thinking" style={{ opacity: gameState.isPlayerTurn ? 0 : 1 }}>
                  Pensando...
                </div>
              )}
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
            <div className="player-hand" id="player-hand">
              {gameState.playerHand.map((card, index) => (
                <Card
                  key={index}
                  card={card}
                  faceUp={true}
                  onClick={() => onPlayCard(index)}
                  showPower={true}
                  settings={gameSettings}
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
                disabled={gameState.currentEnvidoLevel !== 0 || gameState.waitingForResponse}
                style={{ display: gameState.currentEnvidoLevel === 0 && !gameState.waitingForResponse ? 'block' : 'none' }}
              >
                🎵 Envido
              </button>
              <button
                className="action-button"
                id="real-envido-btn"
                onClick={() => {}} // TODO: Implement
                disabled={gameState.currentEnvidoLevel !== 1 || gameState.waitingForResponse}
                style={{ display: gameState.currentEnvidoLevel === 1 && !gameState.waitingForResponse ? 'block' : 'none' }}
              >
                🎶 Real Envido
              </button>
              <button
                className="action-button"
                id="falta-envido-btn"
                onClick={() => {}} // TODO: Implement
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;