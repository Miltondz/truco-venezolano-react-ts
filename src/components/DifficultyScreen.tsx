import React from 'react';
import { BaseScreenProps, GameState } from '../types';

interface DifficultyScreenProps extends BaseScreenProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onStartGame: () => void;
}

const DifficultyScreen: React.FC<DifficultyScreenProps> = ({ onNavigate, gameState, setGameState, onStartGame }) => {
  const selectDifficulty = (difficulty: string) => {
    setGameState({ ...gameState, difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'master' });
  };

  return (
    <div id="difficulty-screen" className="screen active">
      <button className="back-button" onClick={() => onNavigate('setup-screen')}>← Volver</button>
      <div className="screen-content">
        <h2 className="game-title">Seleccionar Dificultad</h2>
        <div className="difficulty-buttons">
          <button className={`difficulty-button ${gameState.difficulty === 'easy' ? 'selected' : ''}`} data-difficulty="easy" onClick={() => selectDifficulty('easy')}>
            🟢 Principiante
            <div style={{ fontSize: '0.6rem', marginTop: '0.5rem' }}>IA básica, consejos activados</div>
          </button>
          <button className={`difficulty-button ${gameState.difficulty === 'medium' ? 'selected' : ''}`} data-difficulty="medium" onClick={() => selectDifficulty('medium')}>
            🟡 Intermedio
            <div style={{ fontSize: '0.6rem', marginTop: '0.5rem' }}>IA inteligente, algunos consejos</div>
          </button>
          <button className={`difficulty-button ${gameState.difficulty === 'hard' ? 'selected' : ''}`} data-difficulty="hard" onClick={() => selectDifficulty('hard')}>
            🔴 Experto
            <div style={{ fontSize: '0.6rem', marginTop: '0.5rem' }}>IA avanzada, sin consejos</div>
          </button>
          <button className={`difficulty-button ${gameState.difficulty === 'master' ? 'selected' : ''}`} data-difficulty="master" onClick={() => selectDifficulty('master')}>
            ⚫ Maestro
            <div style={{ fontSize: '0.6rem', marginTop: '0.5rem' }}>IA perfecta, máximo desafío</div>
          </button>
        </div>
        <button id="start-game-btn" className="menu-button" style={{ marginTop: '2rem' }} onClick={onStartGame}>
          🚀 Comenzar Juego
        </button>
      </div>
    </div>
  );
};

export default DifficultyScreen;