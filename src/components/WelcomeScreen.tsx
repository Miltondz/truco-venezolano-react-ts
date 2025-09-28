import React, { useEffect, useState } from 'react';
import { BaseScreenProps } from '../types';

interface WelcomeScreenProps extends BaseScreenProps {}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // Preload video for better performance
    const video = document.createElement('video');
    video.src = '/images/cover.mp4';
    video.onloadeddata = () => setVideoLoaded(true);
    video.onerror = () => setVideoError(true);
  }, []);

  const handleEnter = () => {
    onNavigate('main-screen');
  };

  return (
    <div id="welcome-screen" className="screen welcome-screen active">
      {/* Video Background */}
      <div className="video-background">
        {!videoError ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="cover-video"
            poster="/images/cover.jpg"
            onError={() => setVideoError(true)}
          >
            <source src="/images/cover.mp4" type="video/mp4" />
          </video>
        ) : (
          /* Fallback to image if video fails */
          <img
            src="/images/cover.jpg"
            alt="Truco Venezolano"
            className="cover-image"
          />
        )}
        
        {/* Video Overlay for better text visibility */}
        <div className="video-overlay"></div>
      </div>

      {/* Welcome Content */}
      <div className="welcome-content">
        {/* Loading indicator */}
        {!videoLoaded && !videoError && (
          <div className="loading-indicator">
            <span>Cargando...</span>
          </div>
        )}
      </div>
      
      {/* Botón fuera del welcome-content para evitar pointer-events none */}
      <div className="welcome-actions-bottom">
        <button 
          className="btn-primary welcome-enter-btn"
          onClick={handleEnter}
          aria-label="Entrar al juego"
        >
          🚀 ENTRAR
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;