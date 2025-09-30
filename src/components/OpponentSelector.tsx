import React, { useState, useEffect } from 'react';
import { AICharacter } from '../types';
import { getActiveAICharacters, getDifficultyLabel, getPersonalityLabel } from '../data/aiCharacters';

interface OpponentSelectorProps {
  selectedOpponent: AICharacter | null;
  onOpponentSelect: (opponent: AICharacter) => void;
}

const OpponentSelector: React.FC<OpponentSelectorProps> = ({ 
  selectedOpponent, 
  onOpponentSelect 
}) => {
  const [activeCharacters] = useState<AICharacter[]>(getActiveAICharacters());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [avatarError, setAvatarError] = useState(false);

  // Initialize with first active character if none selected
  useEffect(() => {
    if (!selectedOpponent && activeCharacters.length > 0) {
      onOpponentSelect(activeCharacters[0]);
      setCurrentIndex(0);
    } else if (selectedOpponent) {
      const index = activeCharacters.findIndex(char => char.id === selectedOpponent.id);
      if (index >= 0) {
        setCurrentIndex(index);
      }
    }
  }, [selectedOpponent, activeCharacters, onOpponentSelect]);

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : activeCharacters.length - 1;
    setCurrentIndex(newIndex);
    onOpponentSelect(activeCharacters[newIndex]);
    setAvatarError(false); // Reset avatar error state
  };

  const handleNext = () => {
    const newIndex = currentIndex < activeCharacters.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onOpponentSelect(activeCharacters[newIndex]);
    setAvatarError(false); // Reset avatar error state
  };

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    const fallbackSrc = '/images/avatars/avatar1-default.jpg';
    
    if (!avatarError && img.src !== fallbackSrc) {
      img.src = fallbackSrc;
      setAvatarError(true);
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'var(--success-color)';
      case 'medium': return 'var(--warning-color)';
      case 'intermediate': return 'var(--btn2-bg)';
      case 'hard': return 'var(--danger-color)';
      case 'master': return 'var(--btn1-bg)';
      default: return 'var(--text-secondary)';
    }
  };

  // Get personality color
  const getPersonalityColor = (personality: string): string => {
    switch (personality) {
      case 'aggressive': return 'var(--danger-color)';
      case 'conservative': return 'var(--success-color)';
      case 'balanced': return 'var(--btn2-bg)';
      case 'unpredictable': return 'var(--warning-color)';
      default: return 'var(--text-secondary)';
    }
  };

  if (!selectedOpponent || activeCharacters.length === 0) {
    return (
      <div className="opponent-selector-placeholder">
        <p>No hay oponentes disponibles</p>
      </div>
    );
  }

  return (
    <div className="opponent-selector">
      {/* Opponent card with new layout: Avatar left, Description right, Stats below avatar */}
      <div className="opponent-card">
        {/* Avatar section - Column 1, Row 1 */}
        <div className="opponent-avatar-section">
          <img 
            className="opponent-avatar"
            src={`/images/avatars/${selectedOpponent.avatar}`}
            alt={`Avatar de ${selectedOpponent.name}`}
            onError={handleAvatarError}
          />
          <div className="opponent-name">
            <h4>{selectedOpponent.name}</h4>
          </div>
        </div>

        {/* Description section - Column 2, Row 1 */}
        <p className="opponent-description">
          {selectedOpponent.description}
        </p>

        {/* Stats and Tags section - Column 1, Row 2 (below avatar) */}
        <div className="opponent-stats-container">
          <div className="opponent-stats">
            <div className="stat-item">
              <span className="stat-label">Agresividad:</span>
              <div className="stat-bar">
                <div 
                  className="stat-fill" 
                  style={{ width: `${selectedOpponent.agresividad * 10}%` }}
                />
              </div>
              <span className="stat-value">{selectedOpponent.agresividad}/10</span>
            </div>

            <div className="stat-item">
              <span className="stat-label">Riesgo:</span>
              <div className="stat-bar">
                <div 
                  className="stat-fill" 
                  style={{ width: `${selectedOpponent.riesgo * 10}%` }}
                />
              </div>
              <span className="stat-value">{selectedOpponent.riesgo}/10</span>
            </div>

            <div className="stat-item">
              <span className="stat-label">Blufeo:</span>
              <div className="stat-bar">
                <div 
                  className="stat-fill" 
                  style={{ width: `${selectedOpponent.blufeo * 10}%` }}
                />
              </div>
              <span className="stat-value">{selectedOpponent.blufeo}/10</span>
            </div>

            <div className="stat-item">
              <span className="stat-label">Consistencia:</span>
              <div className="stat-bar">
                <div 
                  className="stat-fill" 
                  style={{ width: `${selectedOpponent.consistencia * 10}%` }}
                />
              </div>
              <span className="stat-value">{selectedOpponent.consistencia}/10</span>
            </div>
          </div>

          {/* Tags below stats */}
          <div className="opponent-tags">
            <span 
              className="opponent-tag difficulty-tag"
              style={{ color: getDifficultyColor(selectedOpponent.difficulty) }}
            >
              {getDifficultyLabel(selectedOpponent.difficulty)}
            </span>
            <span 
              className="opponent-tag personality-tag"
              style={{ color: getPersonalityColor(selectedOpponent.personality) }}
            >
              {getPersonalityLabel(selectedOpponent.personality)}
            </span>
          </div>
        </div>

        {/* Navigation buttons spanning full width at bottom */}
        <div className="opponent-nav-buttons">
          <button 
            className="opponent-nav-btn opponent-nav-prev"
            onClick={handlePrevious}
            aria-label="Oponente anterior"
          >
            ← Anterior
          </button>
          
          {/* Counter indicator */}
          <div className="opponent-counter">
            {currentIndex + 1} / {activeCharacters.length}
          </div>
          
          <button 
            className="opponent-nav-btn opponent-nav-next"
            onClick={handleNext}
            aria-label="Siguiente oponente"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpponentSelector;