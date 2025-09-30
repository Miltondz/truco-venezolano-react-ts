import React, { useEffect, useState } from 'react';

interface VictorySplashProps {
  isVisible: boolean;
  type: 'match' | 'round' | 'tournament';
  opponentName?: string;
  roundName?: string;
  tournamentName?: string;
  reward?: string;
  levelUp?: { from: number; to: number };
  experienceGained?: number;
  onDismiss: () => void;
  autoHide?: boolean;
  hideDelay?: number;
}

const VictorySplash: React.FC<VictorySplashProps> = ({
  isVisible,
  type,
  opponentName,
  roundName,
  tournamentName,
  reward,
  levelUp,
  experienceGained,
  onDismiss,
  autoHide = true,
  hideDelay = 3000
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      if (autoHide) {
        const timer = setTimeout(() => {
          setShow(false);
          setTimeout(onDismiss, 300);
        }, hideDelay);
        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
    }
  }, [isVisible, autoHide, hideDelay, onDismiss]);

  if (!isVisible && !show) return null;

  const getMediaSrc = () => {
    switch (type) {
      case 'tournament':
        return '/images/celebrations/champion.mp4';
      case 'round':
        return '/images/celebrations/round_complete.jpg';
      default:
        return '/images/celebrations/victory.jpg';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'tournament':
        return '¡CAMPEÓN DEL TORNEO! 👑';
      case 'round':
        return '¡Ronda Completada! 🎯';
      default:
        return '¡Victoria! 🏆';
    }
  };

  const isVideo = getMediaSrc().endsWith('.mp4');

  return (
    <div className={`victory-splash-overlay ${show ? '' : 'hidden'} victory-splash-type-${type}`}>
      <div className="victory-splash-container">
        <div className="victory-splash-confetti"></div>
        
        <h1 className="victory-splash-title">{getTitle()}</h1>
        
        <div className="victory-splash-media">
          {isVideo ? (
            <video
              autoPlay
              muted
              loop={type === 'tournament'}
              className="victory-splash-video"
              poster="/images/celebrations/champion_fallback.jpg"
            >
              <source src={getMediaSrc()} type="video/mp4" />
            </video>
          ) : (
            <img 
              src={getMediaSrc()} 
              alt="Celebration" 
              className="victory-splash-image"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = '/images/cover.jpg'; // Fallback a imagen existente
              }}
            />
          )}
        </div>

        {type === 'match' && opponentName && (
          <p className="victory-splash-subtitle">
            Has derrotado a <strong>{opponentName}</strong>
          </p>
        )}
        
        {type === 'round' && roundName && (
          <p className="victory-splash-subtitle">
            Has completado <strong>{roundName}</strong>
          </p>
        )}
        
        {type === 'tournament' && tournamentName && (
          <p className="victory-splash-subtitle">
            Has conquistado el <strong>{tournamentName}</strong>
          </p>
        )}

        {reward && (
          <div className="victory-splash-reward">
            🏅 {reward}
          </div>
        )}

        {experienceGained !== undefined && (
          <div className="victory-splash-xp">
            <div className="victory-splash-xp-text">
              +{experienceGained} XP Ganada
            </div>
          </div>
        )}

        {levelUp && (
          <div className="victory-splash-levelup">
            <div className="victory-splash-levelup-title">¡SUBIDA DE NIVEL!</div>
            <div className="victory-splash-levelup-levels">
              Nivel {levelUp.from} → Nivel {levelUp.to}
            </div>
          </div>
        )}
        
        {!autoHide && (
          <button className="victory-splash-button" onClick={onDismiss}>
            Continuar
          </button>
        )}
      </div>
    </div>
  );
};

export default VictorySplash;