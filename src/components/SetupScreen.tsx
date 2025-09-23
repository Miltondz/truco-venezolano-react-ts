import React from 'react';
import { BaseScreenProps, GameSettings, DECKS, BOARDS } from '../types';

interface SetupScreenProps extends BaseScreenProps {
  gameSettings: GameSettings;
  setGameSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onNavigate, gameSettings, setGameSettings }) => {
  return (
    <div id="setup-screen" className="screen active">
      <button className="back-button" onClick={() => onNavigate('main-screen')}>← Volver</button>
      <div className="screen-content">
        <h2 className="game-title">Preparar Partida</h2>
        <div className="setup-grid">
          <div className="setup-section">
            <h3 className="setup-title">Elige tu Baraja</h3>
            <div className="selection-grid" id="deck-selection">
              {DECKS.map(deckName => (
                <div
                  key={deckName}
                  className={`selection-item ${gameSettings.selectedDeck === deckName ? 'selected' : ''}`}
                  onClick={() => setGameSettings({ ...gameSettings, selectedDeck: deckName })}
                >
                  <img src={`/images/decks/${deckName}/deck-preview.jpg`} alt={`Preview ${deckName}`} />
                  <div className="item-name">{deckName}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="setup-section">
            <h3 className="setup-title">Elige el Tablero</h3>
            <div className="selection-grid" id="board-selection">
              {BOARDS.map(boardFile => (
                <div
                  key={boardFile}
                  className={`selection-item ${gameSettings.selectedBoard === boardFile ? 'selected' : ''}`}
                  onClick={() => setGameSettings({ ...gameSettings, selectedBoard: boardFile })}
                >
                  <img src={`/images/backgrounds/${boardFile}`} alt={`Preview ${boardFile}`} />
                  <div className="item-name">{boardFile.replace('tablero-', '').replace('.jpg', '')}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="setup-section">
            <h3 className="setup-title">Tu Oponente</h3>
            <div className="avatar-preview">
              <img id="setup-avatar-preview" src="/images/avatars/avatar1.jpg" alt="Avatar del Oponente" className="avatar-image" style={{ width: '120px', height: '120px' }} />
              <p className="game-subtitle">Un nuevo retador te espera...</p>
            </div>
          </div>
        </div>
        <button id="continue-to-difficulty-btn" className="menu-button" style={{ marginTop: '2rem' }} onClick={() => onNavigate('difficulty-screen')}>
          Continuar →
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;