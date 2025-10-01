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
  const [currentTab, setCurrentTab] = React.useState(0);
  
  // Track previous selections to detect new selections only
  const prevDeckRef = React.useRef<string | null>(null);
  const prevBoardRef = React.useRef<string | null>(null);
  
  // Tab definitions
  const tabs = [
    { id: 0, title: '🎴 Baraja', key: 'deck' },
    { id: 1, title: '🎯 Tablero', key: 'board' },
    { id: 2, title: '🤖 Oponente', key: 'opponent' }
  ];
  
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
  
  // Track selections but DON'T auto-advance - let user control tab navigation
  React.useEffect(() => {
    // Update refs when selections change, but don't change tabs automatically
    if (gameSettings.selectedDeck && gameSettings.selectedDeck !== prevDeckRef.current) {
      prevDeckRef.current = gameSettings.selectedDeck;
    }
    
    if (gameSettings.selectedBoard && gameSettings.selectedBoard !== prevBoardRef.current) {
      prevBoardRef.current = gameSettings.selectedBoard;
    }
  }, [gameSettings.selectedDeck, gameSettings.selectedBoard]);
  
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
        
        {/* Tab Navigation */}
        <div className="tab-navigation" style={{ marginBottom: '1rem' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${currentTab === tab.id ? 'active' : ''} ${
                (tab.id === 0 && gameSettings.selectedDeck) ||
                (tab.id === 1 && gameSettings.selectedBoard) ||
                (tab.id === 2 && gameState.selectedOpponent)
                  ? 'completed' : ''
              }`}
              onClick={() => setCurrentTab(tab.id)}
              disabled={
                (tab.id === 1 && !gameSettings.selectedDeck) ||
                (tab.id === 2 && (!gameSettings.selectedDeck || !gameSettings.selectedBoard))
              }
            >
              {/* Mostrar checkmark si el tab está completo */}
              {((tab.id === 0 && gameSettings.selectedDeck) ||
                (tab.id === 1 && gameSettings.selectedBoard) ||
                (tab.id === 2 && gameState.selectedOpponent)) && '✓ '}
              {tab.title}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {currentTab === 0 && (
            <div className="setup-section" style={{ maxHeight: 'none', overflow: 'visible' }}>
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
          )}

          {currentTab === 1 && (
            <div className="setup-section" style={{ maxHeight: 'none', overflow: 'visible' }}>
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
          )}

          {currentTab === 2 && (
            <div className="setup-section opponent-section" style={{ maxHeight: 'none', overflow: 'visible' }}>
              <h3 className="setup-title">Tu Oponente</h3>
              <OpponentSelector 
                selectedOpponent={gameState.selectedOpponent}
                onOpponentSelect={handleOpponentSelect}
              />
            </div>
          )}
        </div>

        {/* Start Game Button - Only visible on last tab */}
        {currentTab === 2 && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', marginTop: '1rem' }}>
            <button id="start-game-btn" className="menu-button" onClick={handleStartGame}>
              🎮 Iniciar Partida
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupScreen;