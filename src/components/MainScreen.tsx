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
className="cover-video"
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
        <div className="main-menu-container">
          <button
            id="play-btn"
            className="menu-button menu-button-primary"
            onClick={() => onNavigate('setup-screen')}
          >
            🎮 Truco Venezolano
          </button>

          <div className="main-menu-games-row">
            <button id="siete-medio-btn" className="menu-button menu-button-game" onClick={() => onNavigate('siete-medio-screen')}>
              🃏 Siete y Medio
            </button>
            <button id="brisca-btn" className="menu-button menu-button-game" onClick={() => onNavigate('brisca-screen')}>
              🎴 Brisca
            </button>
            <button id="chinchon-btn" className="menu-button menu-button-game" onClick={() => onNavigate('chinchon-screen')}>
              🃏 Chinchón
            </button>
          </div>

          <div className="main-menu-aux-row">
            <button id="tournament-btn" className="menu-button menu-button-aux" onClick={() => onNavigate('tournaments-screen')}>
              🏁 Torneo
            </button>
            <button id="tutorial-btn" className="menu-button menu-button-aux" onClick={() => onNavigate('tutorial-screen')}>
              🎓 Tutorial
            </button>
            <button id="instructions-btn" className="menu-button menu-button-aux" onClick={() => onNavigate('instructions-screen')}>
              📖 Reglas
            </button>
            <button id="achievements-btn" className="menu-button menu-button-aux" onClick={() => onNavigate('achievements-screen')}>
              🏆 Logros
            </button>
            <button id="settings-btn" className="menu-button menu-button-aux" onClick={() => onNavigate('settings-screen')}>
              ⚙️ Config
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainScreen;