import React from 'react';
import { Card as CardType, GameSettings } from '../types';

interface CardProps {
  card: CardType | null;
  faceUp?: boolean;
  onClick?: () => void;
  className?: string;
  showPower?: boolean;
  settings: GameSettings;
}

const Card: React.FC<CardProps> = ({
  card,
  faceUp = true,
  onClick,
  className = '',
  showPower = false,
  settings
}) => {
  const content = faceUp && card ? (
    <>
      <img
        src={`/images/decks/${settings.selectedDeck}/${card.imageFile}`}
        alt={card.name}
        className="card-image"
      />
      {settings.showCardPower && showPower && (
        <div className="card-power-indicator">
          {card.power}
        </div>
      )}
    </>
  ) : (
    <img
      src={`/images/decks/${settings.selectedDeck}/card-back.jpg`}
      alt="Carta boca abajo"
      className="card-image"
    />
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`card ${className}`}
        onClick={onClick}
        aria-label={faceUp && card ? card.name : 'Carta'}
        style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`card ${className}`}
      role={faceUp && card ? 'img' : undefined}
      aria-label={faceUp && card ? card.name : undefined}
      style={{ cursor: 'default' }}
    >
      {content}
    </div>
  );
};

export default Card;
