import React from 'react';
import { BaseScreenProps } from '../types';

interface MainScreenProps extends BaseScreenProps {}

const MainScreen: React.FC<MainScreenProps> = ({ onNavigate }) => {
  return (
    <div id="main-screen" className="screen main-screen active">
      <div className="screen-content">
        <h1 className="game-title">TRUCO</h1>
        <p className="game-subtitle">Venezolano</p>
        <div className="main-menu-buttons">
          <button id="play-btn" className="menu-button" onClick={() => onNavigate('setup-screen')}>
            🎮 Jugar
          </button>
          <button id="tutorial-btn" className="menu-button" onClick={() => onNavigate('tutorial-screen')}>
            🎓 Tutorial
          </button>
          <button id="instructions-btn" className="menu-button" onClick={() => onNavigate('instructions-screen')}>
            📖 Instrucciones
          </button>
          <button id="stats-btn" className="menu-button" onClick={() => onNavigate('stats-screen')}>
            📊 Estadísticas
          </button>
          <button id="achievements-btn" className="menu-button" onClick={() => onNavigate('achievements-screen')}>
            🏆 Logros
          </button>
          <button id="settings-btn" className="menu-button" onClick={() => onNavigate('settings-screen')}>
            ⚙️ Configuración
          </button>
          <button id="test-btn" className="menu-button" onClick={() => onNavigate('test-screen')}>
            🧪 Tests
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainScreen;