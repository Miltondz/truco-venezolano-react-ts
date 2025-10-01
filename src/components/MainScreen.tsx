import React, { useState, useEffect } from 'react';
import { BaseScreenProps } from '../types';

interface MainScreenProps extends BaseScreenProps {}

const MainScreen: React.FC<MainScreenProps> = ({ onNavigate }) => {
  const [videoError, setVideoError] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div id="main-screen" className="screen main-screen active">
      {/* Video Background - Responsive */}
      <div className="video-background">
        {!videoError ? (
          <video
            key={isMobile ? 'mobile' : 'desktop'}
            autoPlay
            muted
            loop
            playsInline
            className="background-video"
            poster={isMobile ? "/images/cover-mobile.jpg" : "/images/cover.jpg"}
            onError={() => setVideoError(true)}
          >
            <source 
              src={isMobile ? "/images/cover-mobile.mp4" : "/images/cover.mp4"} 
              type="video/mp4" 
            />
          </video>
        ) : (
          <img
            src={isMobile ? "/images/cover-mobile.jpg" : "/images/cover.jpg"}
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
          <button id="tournament-btn" className="menu-button" onClick={() => onNavigate('tournaments-screen')}>
            🏁 Jugar Torneo
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