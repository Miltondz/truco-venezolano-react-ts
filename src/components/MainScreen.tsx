import React, { useState } from 'react';
import { BaseScreenProps } from '../types';

interface MainScreenProps extends BaseScreenProps {}

const MainScreen: React.FC<MainScreenProps> = ({ onNavigate }) => {
  const [videoError, setVideoError] = useState(false);

  return (
    <div id="main-screen" className="screen main-screen active">
      {/* Video Background */}
      <div className="video-background">
        {!videoError ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="background-video"
            poster="/images/cover.jpg"
            onError={() => setVideoError(true)}
          >
            <source src="/images/cover.mp4" type="video/mp4" />
          </video>
        ) : (
          <img
            src="/images/cover.jpg"
            alt="Truco Venezolano Background"
            className="background-image"
          />
        )}
        
        {/* Video Overlay */}
        <div className="video-overlay"></div>
      </div>

      <div className="screen-content">
        <div className="main-menu-buttons-bottom">
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
        </div>
      </div>
    </div>
  );
};

export default MainScreen;