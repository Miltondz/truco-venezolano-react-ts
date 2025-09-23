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
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div
      className={`card ${className}`}
      onClick={handleClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {faceUp && card ? (
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
      )}
    </div>
  );
};

export default Card;