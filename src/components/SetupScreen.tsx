import React from 'react';
import { BaseScreenProps, GameSettings, GameState, DECKS, BOARDS, AICharacter } from '../types';
import OpponentSelector from './OpponentSelector';

interface SetupScreenProps extends BaseScreenProps {
  gameSettings: GameSettings;
  setGameSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onStartGame: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onNavigate, gameSettings, setGameSettings, gameState, setGameState, onStartGame }) => {
  const [avatarError, setAvatarError] = React.useState(false);
  
  // Handle avatar image loading errors
  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    const fallbackSrc = '/images/avatars/avatar1-default.jpg';
    
    if (!avatarError && img.src !== fallbackSrc) {
      img.src = fallbackSrc;
      setAvatarError(true);
    }
  };
  
  // Reset error state when selected avatar changes
  React.useEffect(() => {
    setAvatarError(false);
  }, [gameState.selectedAvatar]);
  
  // Force scroll styles on setup sections
  React.useEffect(() => {
    const setupSections = document.querySelectorAll('#setup-screen .setup-section:not(.opponent-section)');
    setupSections.forEach((section) => {
      const htmlSection = section as HTMLElement;
      htmlSection.style.maxHeight = '380px';
      htmlSection.style.overflowY = 'auto';
      htmlSection.style.overflowX = 'hidden';
      htmlSection.style.position = 'relative';
      htmlSection.style.boxSizing = 'border-box';
    });
  }, []);
  
  // Handle opponent selection
  const handleOpponentSelect = (opponent: AICharacter) => {
    console.log('SetupScreen - Selecting opponent:', opponent);
    setGameState(prevState => ({
      ...prevState,
      selectedOpponent: opponent,
      difficulty: opponent.difficulty // Set difficulty from opponent
    }));
  };
  
  // Handle start game - validate selections first
  const handleStartGame = () => {
    if (!gameState.selectedOpponent) {
      alert('Por favor selecciona un oponente');
      return;
    }
    if (!gameSettings.selectedDeck) {
      alert('Por favor selecciona una baraja');
      return;
    }
    if (!gameSettings.selectedBoard) {
      alert('Por favor selecciona un tablero');
      return;
    }
    
    console.log('SetupScreen - Starting game with:', {
      opponent: gameState.selectedOpponent,
      difficulty: gameState.selectedOpponent.difficulty,
      deck: gameSettings.selectedDeck,
      board: gameSettings.selectedBoard
    });
    
    onStartGame();
  };


  return (
    <div id="setup-screen" className="screen active">
      <button className="back-button" onClick={() => onNavigate('main-screen')}>← Volver</button>
      <div className="screen-content">
        <h2 className="game-title">Preparar Partida</h2>
        <div className="setup-grid">
          <div className="setup-section deck-board-section-scroll-force" style={{maxHeight: '380px', overflowY: 'auto', overflowX: 'hidden'}}>
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
          <div className="setup-section deck-board-section-scroll-force" style={{maxHeight: '380px', overflowY: 'auto', overflowX: 'hidden'}}>
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
          <div className="setup-section opponent-section">
            <h3 className="setup-title">Tu Oponente</h3>
            <OpponentSelector 
              selectedOpponent={gameState.selectedOpponent}
              onOpponentSelect={handleOpponentSelect}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem' }}>
          <button id="start-game-btn" className="menu-button" onClick={handleStartGame}>
            🎮 Iniciar Partida
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;