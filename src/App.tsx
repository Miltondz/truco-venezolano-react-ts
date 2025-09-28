import React, { useState, useEffect } from 'react';
import './styles/App.css';
import { GameState, GameSettings, PlayerStats, Achievement, DECKS, BOARDS, AVATARS } from './types';
import { initializeGameState, startNewHand, playCard, computerPlayCard, evaluateRound, endHand, checkGameEnd, callTruco, callRetruco, callVale4, callEnvido, acceptCall, rejectCall, resolveEnvido, callFlor, foldHand, getAiDelay, callValeNueve, callValeJuego, callRealEnvido, callFaltaEnvido, callEstarCantando } from './utils/gameLogic';
import { initializeAudio, playSound } from './utils/sound';
import { loadSettings, saveSettings, loadStats, saveStats, loadAchievements, saveAchievements } from './utils/storage';
import { calculateHandStrength } from './utils/cards';
import { evaluatePlayResult, updateAvatarMood } from './utils/avatarMoods';
import MainScreen from './components/MainScreen';
import SetupScreen from './components/SetupScreen';
import DifficultyScreen from './components/DifficultyScreen';
import GameBoard from './components/GameBoard';
import InstructionsScreen from './components/InstructionsScreen';
import StatsScreen from './components/StatsScreen';
import AchievementsScreen from './components/AchievementsScreen';
import SettingsScreen from './components/SettingsScreen';
import TutorialScreen from './components/TutorialScreen';
import LoadingScreen from './components/LoadingScreen';
import WelcomeScreen from './components/WelcomeScreen';
import Notification from './components/Notification';
import Modal from './components/Modal';
import AchievementPopup from './components/AchievementPopup';
import { TestScreen } from './components/TestScreen';

const App: React.FC = () => {
  // State management
  const [currentScreen, setCurrentScreen] = useState<string>('loading');
  const [gameState, setGameState] = useState<GameState>(initializeGameState('medium', 'avatar1.jpg'));
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    soundEffectsEnabled: true,
    backgroundMusicEnabled: false,
    masterVolume: 70,
    effectsVolume: 80,
    musicVolume: 50,
    animationsEnabled: true,
    confirmMoves: false,
    showHints: true,
    autoPlay: false,
    gameSpeed: 3,
    darkMode: true,
    particlesEnabled: true,
    hdCards: false,
    showCardPower: true,
    handStrengthIndicator: true,
    showAiThinking: true,
    aiResponseTime: 5,
    aiPersonality: 'balanced',
    largeText: false,
    highContrast: false,
    reduceMotion: false,
    voiceNarration: false,
    autoSave: true,
    cloudSync: false,
    selectedDeck: 'default',
    selectedBoard: 'tablero-cama.jpg'
  });

  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    trucosCalled: 0,
    trucosWon: 0,
    envidosCalled: 0,
    envidosWon: 0,
    floresAchieved: 0,
    totalPoints: 0,
    bestStreak: 0,
    currentStreak: 0,
    timePlayed: 0,
    playerLevel: 1,
    experience: 0
  });

  const [achievements, setAchievements] = useState<Record<string, Achievement>>({
    firstWin: { unlocked: false, name: "Primera Victoria", description: "Gana tu primera partida", icon: "🏆" },
    trucoMaster: { unlocked: false, name: "Maestro del Truco", description: "Gana 10 trucos", icon: "⚡" },
    envidoExpert: { unlocked: false, name: "Experto en Envido", description: "Gana 10 envidos", icon: "🎵" },
    florCollector: { unlocked: false, name: "Coleccionista de Flores", description: "Consigue 5 flores", icon: "🌸" },
    winStreak5: { unlocked: false, name: "Racha de 5", description: "Gana 5 partidas seguidas", icon: "🔥" },
    winStreak10: { unlocked: false, name: "Racha de 10", description: "Gana 10 partidas seguidas", icon: "🔥🔥" },
    perfectGame: { unlocked: false, name: "Juego Perfecto", description: "Gana 30-0", icon: "💎" },
    speedster: { unlocked: false, name: "Velocista", description: "Gana en menos de 5 minutos", icon: "⚡" },
    veteran: { unlocked: false, name: "Veterano", description: "Juega 100 partidas", icon: "🎖️" },
    levelUp: { unlocked: false, name: "Subida de Nivel", description: "Alcanza el nivel 10", icon: "⭐" }
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [modal, setModal] = useState<{ title: string; message: string; onConfirm?: () => void } | null>(null);
  const [achievementPopup, setAchievementPopup] = useState<{ icon: string; title: string; description: string } | null>(null);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      // Load saved data
      const savedSettings = loadSettings();
      if (savedSettings) {
        setGameSettings(savedSettings);
      }

      const savedStats = loadStats();
      if (savedStats) {
        setPlayerStats(savedStats);
      }

      const savedAchievements = loadAchievements();
      if (savedAchievements) {
        setAchievements(savedAchievements);
      }

      // Initialize audio
      initializeAudio();

      // Simulate loading
      setTimeout(() => {
        setLoading(false);
        setCurrentScreen('welcome-screen');
      }, 2000);
    };

    initializeApp();
  }, []);

  // Auto-save
  useEffect(() => {
    if (gameSettings.autoSave) {
      saveSettings(gameSettings);
      saveStats(playerStats);
      saveAchievements(achievements);
    }
  }, [gameSettings, playerStats, achievements]);

  // Screen navigation
  const navigateTo = (screen: string) => {
    setCurrentScreen(screen);
    playSound('navigate', gameSettings);
  };

  // Game actions
  const startGame = () => {
    const newGameState = initializeGameState(gameState.difficulty, gameState.selectedAvatar);
    const gameWithHand = startNewHand(newGameState);
    setGameState(gameWithHand);
    navigateTo('game-board');
    playSound('gameStart', gameSettings);
  };

  const handlePlayCard = (cardIndex: number) => {
    if (gameSettings.confirmMoves) {
      setModal({
        title: 'Confirmar Jugada',
        message: `¿Quieres jugar ${gameState.playerHand[cardIndex].name}?`,
        onConfirm: () => {
          executePlayCard(cardIndex);
          setModal(null);
        }
      });
    } else {
      executePlayCard(cardIndex);
    }
  };

  const executePlayCard = (cardIndex: number) => {
    // Prevent multiple actions
    if (gameState.isProcessingAction) return;
    
    // Set processing state
    const newGameState = { ...playCard(gameState, cardIndex, gameSettings), isProcessingAction: true };
    setGameState(newGameState);

    // Computer's turn
    setTimeout(() => {
      const computerState = computerPlayCard(newGameState, gameSettings);
      setGameState(computerState);

      // Evaluate round
      setTimeout(() => {
        const { winner, gameState: evaluatedState } = evaluateRound(computerState, gameSettings);
        setGameState(evaluatedState);

        // Update avatar moods based on round result
        if (winner === 'player') {
          const playerResult = evaluatePlayResult(evaluatedState, true, 'card');
          const computerResult = evaluatePlayResult(evaluatedState, false, 'card');
          
          updateAvatarMood(evaluatedState, setGameState, true, playerResult);
          setTimeout(() => {
            updateAvatarMood(evaluatedState, setGameState, false, computerResult);
          }, 500);
        } else if (winner === 'computer') {
          const playerResult = evaluatePlayResult(evaluatedState, true, 'card');
          const computerResult = evaluatePlayResult(evaluatedState, false, 'card');
          
          updateAvatarMood(evaluatedState, setGameState, false, computerResult);
          setTimeout(() => {
            updateAvatarMood(evaluatedState, setGameState, true, playerResult);
          }, 500);
        }

        // Handle round result and reset processing state
        setTimeout(() => {
          const finalState = { ...evaluatedState, isProcessingAction: false };
          setGameState(finalState);
          handleRoundResult(finalState, winner);
        }, 3000);
      }, 1500);
    }, getAiDelay(gameSettings));
  };

  const handleRoundResult = (currentState: GameState, winner: 'player' | 'computer' | 'tie') => {
    const newRoundsWon = { ...currentState.roundsWon };
    if (winner === 'player') newRoundsWon.player++;
    else if (winner === 'computer') newRoundsWon.computer++;

    let handWinner: 'player' | 'computer' | 'tie' = 'tie';

    if (newRoundsWon.player >= 2) handWinner = 'player';
    else if (newRoundsWon.computer >= 2) handWinner = 'computer';
    else if (currentState.currentRound >= currentState.maxRounds) {
      if (newRoundsWon.player > newRoundsWon.computer) handWinner = 'player';
      else if (newRoundsWon.computer > newRoundsWon.player) handWinner = 'computer';
    }

    if (handWinner !== 'tie') {
      const { gameState: endState, pointsAdded } = endHand(currentState, handWinner, gameSettings);
      const finalState = { ...endState, roundsWon: newRoundsWon };
      setGameState(finalState);

      const gameEnd = checkGameEnd(finalState);
      if (gameEnd) {
        handleGameEnd(finalState, gameEnd);
      } else {
        // Start new hand
        setTimeout(() => {
          const newHandState = startNewHand(finalState);
          setGameState(newHandState);
        }, 2000);
      }
    } else {
      // Continue to next round
      setGameState({
        ...currentState,
        currentRound: currentState.currentRound + 1,
        isPlayerTurn: true,
        roundsWon: newRoundsWon,
        playerPlayedCard: null,
        computerPlayedCard: null
      });
    }
  };

  const handleGameEnd = (finalState: GameState, winner: 'player' | 'computer') => {
    const gameTime = Date.now() - finalState.gameStartTime;
    const gameTimeMinutes = Math.floor(gameTime / 60000);

    const newStats = { ...playerStats };
    newStats.gamesPlayed++;
    newStats.timePlayed += gameTimeMinutes;

    if (winner === 'player') {
      newStats.gamesWon++;
      newStats.currentStreak++;
      newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);

      // Player wins game - excellent result
      updateAvatarMood(finalState, setGameState, true, 'excellent');
      updateAvatarMood(finalState, setGameState, false, 'terrible');

      showNotification('¡Felicidades! ¡Has ganado el juego!', 'success');
      playSound('gameWin', gameSettings);
    } else {
      newStats.currentStreak = 0;
      
      // Computer wins game - excellent result for AI
      updateAvatarMood(finalState, setGameState, false, 'excellent');
      updateAvatarMood(finalState, setGameState, true, 'terrible');
      
      showNotification('La computadora ha ganado. ¡Mejor suerte la próxima vez!', 'error');
      playSound('gameLose', gameSettings);
    }

    // Update level
    newStats.experience += newStats.gamesWon * 10 + newStats.totalPoints;
    newStats.playerLevel = Math.floor(newStats.experience / 100) + 1;

    setPlayerStats(newStats);

    setTimeout(() => {
      navigateTo('main-screen');
    }, 3000);
  };

  // Helper function for protected call actions
  const executeProtectedAction = (actionFn: () => GameState, resultType: 'call' | 'response' = 'call', actionSuccess?: boolean) => {
    // Bloquear solo si está procesando una acción
    // Para respuestas (Quiero/No Quiero), permitir cuando waitingForResponse es true
    // Para cantos, bloquear cuando waitingForResponse es true
    if (gameState.isProcessingAction || (resultType === 'call' && gameState.waitingForResponse)) return;
    
    const newState = actionFn();
    setGameState(newState);
    if (newState !== gameState) {
      const result = actionSuccess !== undefined 
        ? evaluatePlayResult(newState, true, 'response', actionSuccess)
        : evaluatePlayResult(newState, true, resultType);
      updateAvatarMood(newState, setGameState, true, result);
    }
  };
  
  // Call actions with avatar mood integration
  const handleCallTruco = () => executeProtectedAction(() => callTruco(gameState, gameSettings), 'call');
  
  const handleCallRetruco = () => executeProtectedAction(() => callRetruco(gameState, gameSettings), 'call');
  const handleCallVale4 = () => executeProtectedAction(() => callVale4(gameState, gameSettings), 'call');
  const handleCallEnvido = () => executeProtectedAction(() => callEnvido(gameState, gameSettings), 'call');
  const handleAcceptCall = () => {
    executeProtectedAction(() => acceptCall(gameState, gameSettings), 'response', true);
  };
  
  const handleRejectCall = () => {
    executeProtectedAction(() => rejectCall(gameState, gameSettings), 'response', false);
  };
  
  const handleCallFlor = () => executeProtectedAction(() => callFlor(gameState, gameSettings), 'call');
  const handleFoldHand = () => executeProtectedAction(() => foldHand(gameState, gameSettings), 'response', false);
  const handleCallValeNueve = () => executeProtectedAction(() => callValeNueve(gameState, gameSettings), 'call');
  const handleCallValeJuego = () => executeProtectedAction(() => callValeJuego(gameState, gameSettings), 'call');
  const handleCallRealEnvido = () => executeProtectedAction(() => callRealEnvido(gameState, gameSettings), 'call');
  const handleCallFaltaEnvido = () => executeProtectedAction(() => callFaltaEnvido(gameState, gameSettings), 'call');
  
  const handleCallEstarCantando = () => {
    if (gameState.isProcessingAction || gameState.waitingForResponse) return;
    
    const newState = callEstarCantando(gameState, gameSettings);
    setGameState(newState);
    if (newState !== gameState) {
      updateAvatarMood(newState, setGameState, true, 'excellent');
    }
  };

  // UI helpers
  const showNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const showModal = (title: string, message: string, onConfirm?: () => void) => {
    setModal({ title, message, onConfirm });
  };

  const hideModal = () => {
    setModal(null);
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome-screen':
        return <WelcomeScreen onNavigate={navigateTo} />;
      case 'main-screen':
        return <MainScreen onNavigate={navigateTo} />;
      case 'setup-screen':
        return <SetupScreen onNavigate={navigateTo} gameSettings={gameSettings} setGameSettings={setGameSettings} gameState={gameState} />;
      case 'difficulty-screen':
        return <DifficultyScreen onNavigate={navigateTo} gameState={gameState} setGameState={setGameState} onStartGame={startGame} />;
      case 'game-board':
        return <GameBoard
          onNavigate={navigateTo}
          gameState={gameState}
          setGameState={setGameState}
          gameSettings={gameSettings}
          onPlayCard={handlePlayCard}
          onCallTruco={handleCallTruco}
          onCallRetruco={handleCallRetruco}
          onCallVale4={handleCallVale4}
          onCallEnvido={handleCallEnvido}
          onAcceptCall={handleAcceptCall}
          onRejectCall={handleRejectCall}
          onCallFlor={handleCallFlor}
          onFoldHand={handleFoldHand}
          onCallValeNueve={handleCallValeNueve}
          onCallValeJuego={handleCallValeJuego}
          onCallRealEnvido={handleCallRealEnvido}
          onCallFaltaEnvido={handleCallFaltaEnvido}
          onCallEstarCantando={handleCallEstarCantando}
        />;
      case 'instructions-screen':
        return <InstructionsScreen onNavigate={navigateTo} />;
      case 'stats-screen':
        return <StatsScreen onNavigate={navigateTo} playerStats={playerStats} />;
      case 'achievements-screen':
        return <AchievementsScreen onNavigate={navigateTo} achievements={achievements} />;
      case 'settings-screen':
        return <SettingsScreen onNavigate={navigateTo} gameSettings={gameSettings} setGameSettings={setGameSettings} />;
      case 'tutorial-screen':
        return <TutorialScreen onNavigate={navigateTo} />;
      case 'test-screen':
        return <TestScreen onNavigate={navigateTo} />;
      default:
        return <MainScreen onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="App">
      <div className="background"></div>
      <div className="texture-overlay"></div>
      <div className="particles" id="particles"></div>

      {loading && <LoadingScreen />}

      {!loading && (
        <div className="main-container">
          <div className="game-canvas">
            {renderScreen()}
          </div>
        </div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {modal && (
        <Modal
          title={modal.title}
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={hideModal}
        />
      )}

      {achievementPopup && (
        <AchievementPopup
          icon={achievementPopup.icon}
          title={achievementPopup.title}
          description={achievementPopup.description}
          onClose={() => setAchievementPopup(null)}
        />
      )}
    </div>
  );
};

export default App;
