import React, { useState, useEffect, useRef } from 'react';
import './styles/App.css';
import { GameState, AICharacter, Tournament, TournamentProgress } from './types';
import { initializeGameState, startNewHand, playCard, computerPlayCard, evaluateRound, checkGameEnd, callTruco, callRetruco, callEnvido, acceptCall, rejectCall, callFlor, computerCallFlor, foldHand, getAiDelay, callValeNueve, callValeJuego, callRealEnvido, callFaltaEnvido, callEstarCantando, applyRoundResult } from './utils/gameLogic';
import { getAICallDecision } from './utils/ai';
import { playSound } from './utils/sound';
import { usePersistence } from './hooks/usePersistence';
import { getTournamentProgress, defeatOpponent, completeRound } from './utils/tournamentStorage';
import { evaluatePlayResult, updateAvatarMood } from './utils/avatarMoods';
import MainScreen from './components/MainScreen';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import InstructionsScreen from './components/InstructionsScreen';
import StatsScreen from './components/StatsScreen';
import AchievementsScreen from './components/AchievementsScreen';
import TournamentsScreen from './components/TournamentsScreen';
import SettingsScreen from './components/SettingsScreen';
import TutorialScreen from './components/TutorialScreen';
import LoadingScreen from './components/LoadingScreen';
import WelcomeScreen from './components/WelcomeScreen';
import Notification from './components/Notification';
import Modal from './components/Modal';
import AchievementPopup from './components/AchievementPopup';
import { TestScreen } from './components/TestScreen';
import DynamicTournamentBracket from './components/DynamicTournamentBracket';
import VictorySplash from './components/VictorySplash';
import SieteMedioScreen from './components/SieteMedioScreen';
import BriscaScreen from './components/BriscaScreen';
import ChinchonScreen from './components/ChinchonScreen';

const App: React.FC = () => {
  // State management
  const [currentScreen, setCurrentScreen] = useState<string>('loading');
  const [gameState, setGameState] = useState<GameState>(initializeGameState('medium', 'avatar1.jpg'));
  const { gameSettings, setGameSettings, playerStats, setPlayerStats, achievements, setAchievements, ready } = usePersistence();

  // Tournament-specific stats (separate from main stats for now)
  const [tournamentStats, setTournamentStats] = useState({
    tournamentsCompleted: 0,
    roundsCompleted: 0,
    perfectTournaments: 0,
    fastestTournament: 0,
    tournamentGamesWon: 0,
    tournamentGamesPlayed: 0
  });

  // Tournament state
  const [availableTournaments, setAvailableTournaments] = useState<Tournament[]>([]); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  
  // Victory splash state
const [victoryState, setVictoryState] = useState<{
    show: boolean;
    type: 'match' | 'round' | 'tournament';
    opponentName?: string;
    roundName?: string;
    tournamentName?: string;
    reward?: string;
    levelUp?: { from: number; to: number };
    experienceGained?: number;
    autoHide?: boolean;
  }>({ show: false, type: 'match', autoHide: true });

  // Pause state — lifted from GameBoard so AI timers can be gated
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [modal, setModal] = useState<{ title: string; message: string; onConfirm?: () => void } | null>(null);
  const [achievementPopup, setAchievementPopup] = useState<{ icon: string; title: string; description: string } | null>(null);

  // Show loading splash then transition to welcome screen once persistence is ready
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      setLoading(false);
      setCurrentScreen('welcome-screen');
    }, 2000);
    return () => clearTimeout(timer);
  }, [ready]);

  // Wire a11y settings to body classes
  useEffect(() => {
    document.body.classList.toggle('a11y-large-text', gameSettings.largeText);
    document.body.classList.toggle('a11y-high-contrast', gameSettings.highContrast);
    document.body.classList.toggle('a11y-reduce-motion', gameSettings.reduceMotion);
  }, [gameSettings.largeText, gameSettings.highContrast, gameSettings.reduceMotion]);

  // AI auto-response to player calls
  useEffect(() => {
    if (!gameState.waitingForResponse || !gameState.gameInProgress) return;
    if (gameState.isProcessingAction) return;
    // Only respond when player made the call (isPlayerTurn stays true after player calls)
    if (!gameState.isPlayerTurn) return;

    const delay = getAiDelay(gameSettings);
    const timer = setTimeout(() => {
      const decision = getAICallDecision(gameState);

      if (decision === 'accept' || decision === 'raise') {
        // raise: existing call functions guard against waitingForResponse, so treat as accept
        // a dedicated AI-raise path can be added later
        setGameState(prev => acceptCall(prev, gameSettings));
      } else {
        setGameState(prev => rejectCall(prev, gameSettings));
      }
    }, delay);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.waitingForResponse, gameState.isPlayerTurn, gameState.lastCall, gameState.gameInProgress]);

  // Computer auto-calls Flor when only it has flor (player has no flor to act first)
  useEffect(() => {
    if (!gameState.gameInProgress || gameState.currentPhase !== 'flor') return;
    if (!gameState.computerHasFlor || gameState.waitingForResponse || gameState.isProcessingAction) return;
    if (gameState.playerHasFlor) return; // Player acts first when both have flor

    const delay = getAiDelay(gameSettings);
    const timer = setTimeout(() => {
      if (isPausedRef.current) return;
      setGameState(prev => computerCallFlor(prev, gameSettings));
    }, delay);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.currentPhase, gameState.computerHasFlor, gameState.playerHasFlor, gameState.gameInProgress, gameState.waitingForResponse, gameState.isProcessingAction]);

  // Screen navigation
  const navigateTo = (screen: string) => {
    setCurrentScreen(screen);
    playSound('navigate', gameSettings);
  };

  // Game actions
  const startTournamentWithOpponent = (opponent: AICharacter) => {
    const newGameState = initializeGameState(opponent.difficulty, gameState.selectedAvatar, opponent);
    const gameWithHand = startNewHand(newGameState);
    setGameState(gameWithHand);
    navigateTo('game-board');
    playSound('gameStart', gameSettings);
  };
  const startGame = () => {
    const newGameState = initializeGameState(gameState.difficulty, gameState.selectedAvatar, gameState.selectedOpponent);
    const gameWithHand = startNewHand(newGameState);
    setGameState(gameWithHand);
    navigateTo('game-board');
    playSound('gameStart', gameSettings);
  };

  const handlePlayCard = (cardIndex: number) => {
    if (gameState.isProcessingAction || gameState.waitingForResponse) return;
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
    
    const played = gameState.playerHand[cardIndex];

    // Set processing state and log player's move
    const newGameState = {
      ...playCard(gameState, cardIndex, gameSettings),
      isProcessingAction: true,
      activeCalls: [...gameState.activeCalls, `Jugador jugó: ${played.name}`].slice(-50)
    };
    setGameState(newGameState);

    // Computer's turn
    setTimeout(() => {
      if (isPausedRef.current) return;
      const computerStateRaw = computerPlayCard(newGameState, gameSettings);
      const compPlayed = computerStateRaw.computerPlayedCard;
      const computerState = {
        ...computerStateRaw,
        activeCalls: compPlayed ? [...computerStateRaw.activeCalls, `Computadora jugó: ${compPlayed.name}`].slice(-50) : computerStateRaw.activeCalls
      };
      setGameState(computerState);

      // Evaluate round
      setTimeout(() => {
        if (isPausedRef.current) return;
        const { winner, gameState: evaluatedState } = evaluateRound(computerState, gameSettings);
        setGameState(evaluatedState);

        // Update avatar moods based on round result
        if (winner === 'player') {
          const playerResult = evaluatePlayResult(evaluatedState, true, 'card');
          const computerResult = evaluatePlayResult(evaluatedState, false, 'card');

          updateAvatarMood(evaluatedState, setGameState, true, playerResult);
          setTimeout(() => {
            if (isPausedRef.current) return;
            updateAvatarMood(evaluatedState, setGameState, false, computerResult);
          }, 500);
        } else if (winner === 'computer') {
          const playerResult = evaluatePlayResult(evaluatedState, true, 'card');
          const computerResult = evaluatePlayResult(evaluatedState, false, 'card');

          updateAvatarMood(evaluatedState, setGameState, false, computerResult);
          setTimeout(() => {
            if (isPausedRef.current) return;
            updateAvatarMood(evaluatedState, setGameState, true, playerResult);
          }, 500);
        }

        // Handle round result and reset processing state
        setTimeout(() => {
          if (isPausedRef.current) return;
          const finalState = { ...evaluatedState, isProcessingAction: false };
          setGameState(finalState);
          handleRoundResult(finalState, winner);
        }, 3500);
      }, 3500);
    }, getAiDelay(gameSettings));
  };

  const handleRoundResult = (currentState: GameState, winner: 'player' | 'computer' | 'tie') => {
    const result = applyRoundResult(currentState, winner, gameSettings);
    setGameState(result.state);

    if (result.gameEnded) {
      const finalWinner = result.state.playerScore > result.state.computerScore ? 'player' : 'computer';
      handleGameEnd(result.state, finalWinner as 'player' | 'computer');
      return;
    }

    if (result.handEnded) {
      // Start new hand after pause
      setTimeout(() => {
        const newHandState = startNewHand(result.state);
        setGameState(newHandState);
      }, 4000);
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

      // Lore indicator
      setGameState(s => ({ ...s, activeCalls: [...s.activeCalls, '— Partida terminada: Gana Jugador —'].slice(-50) }));

      showNotification('¡Felicidades! ¡Has ganado el juego!', 'success');
      playSound('gameWin', gameSettings);
      
      // Handle tournament progress if in tournament
      if (finalState.tournamentContext?.isInTournament) {
        handleTournamentGameEnd(true);
        return; // Don't navigate to main screen, let tournament flow handle it
      }
    } else {
      newStats.currentStreak = 0;
      
      // Computer wins game - excellent result for AI
      updateAvatarMood(finalState, setGameState, false, 'excellent');
      updateAvatarMood(finalState, setGameState, true, 'terrible');

      // Lore indicator
      setGameState(s => ({ ...s, activeCalls: [...s.activeCalls, '— Partida terminada: Gana Computadora —'].slice(-50) }));
      
      showNotification('La computadora ha ganado. ¡Mejor suerte la próxima vez!', 'error');
      playSound('gameLose', gameSettings);
      
      // Handle tournament progress if in tournament (player lost)
      if (finalState.tournamentContext?.isInTournament) {
        handleTournamentGameEnd(false);
        // Navigate back to tournament bracket after delay
        setTimeout(() => {
          if (activeTournament) {
            navigateTo(`tournament-bracket-${activeTournament.id}`);
          } else {
            navigateTo('tournaments-screen');
          }
        }, 3000);
        return;
      }
    }

    // Update level
    newStats.experience += newStats.gamesWon * 10 + newStats.totalPoints;
    newStats.playerLevel = Math.floor(newStats.experience / 100) + 1;

    setPlayerStats(newStats);

    // Mostrar splash con botón para salir (si no es torneo y no fue manejado arriba)
    if (!finalState.tournamentContext?.isInTournament) {
      setVictoryState({ show: true, type: 'match', opponentName: finalState.selectedOpponent?.name, autoHide: false });
    }
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
  const handleCallEnvido = () => executeProtectedAction(() => callEnvido(gameState, gameSettings), 'call');
  const handleAcceptCall = () => {
    executeProtectedAction(() => acceptCall(gameState, gameSettings), 'response', true);
  };
  
  const handleRejectCall = () => {
    executeProtectedAction(() => rejectCall(gameState, gameSettings), 'response', false);
  };
  
  const handleCallFlor = () => executeProtectedAction(() => callFlor(gameState, gameSettings), 'call');
  const handleFoldHand = () => {
    if (gameState.isProcessingAction || gameState.waitingForResponse) return;
    const newState = foldHand(gameState, gameSettings);
    if (newState === gameState) return;
    setGameState(newState);
    updateAvatarMood(newState, setGameState, true, 'bad');

    setTimeout(() => {
      if (isPausedRef.current) return;
      const gameEnd = checkGameEnd(newState);
      if (gameEnd !== null) {
        handleGameEnd(newState, gameEnd);
      } else {
        setGameState(prev => startNewHand(prev));
      }
    }, 3200);
  };
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

  // Tournament functions
  const startTournamentMatch = (opponent: AICharacter) => {
    // Set tournament context in game state
    const tournamentContext = {
      isInTournament: true,
      tournamentId: activeTournament?.id,
      currentRound: getTournamentProgress(activeTournament?.id || '')?.currentRound || 1,
      currentOpponentInRound: 1, // Will be calculated based on progress
      totalOpponentsInRound: activeTournament?.rounds.find(r => r.round === getTournamentProgress(activeTournament?.id || '')?.currentRound)?.opponents.length || 1
    };
    
    const newGameState = {
      ...initializeGameState(opponent.difficulty, gameState.selectedAvatar, opponent),
      tournamentContext
    };
    
    const gameWithHand = startNewHand(newGameState);
    setGameState(gameWithHand);
    navigateTo('game-board');
    playSound('gameStart', gameSettings);
  };
  
  const handleTournamentGameEnd = (playerWon: boolean) => {
    if (!gameState.tournamentContext?.isInTournament) return;
    
    const tournamentId = gameState.tournamentContext.tournamentId;
    const currentRound = gameState.tournamentContext.currentRound;
    const opponentName = gameState.selectedOpponent?.name;
    
    if (!tournamentId || !currentRound || !opponentName) return;
    
    // Update tournament stats
    const newTournamentStats = { ...tournamentStats };
    newTournamentStats.tournamentGamesPlayed++;
    
    if (playerWon) {
      newTournamentStats.tournamentGamesWon++;
      
      // Mark opponent as defeated
      defeatOpponent(tournamentId, currentRound, opponentName);
      
      // Check if round is completed (all opponents defeated)
      const progress = getTournamentProgress(tournamentId);
      const tournament = availableTournaments.find(t => t.id === tournamentId);
      const currentRoundData = tournament?.rounds.find(r => r.round === currentRound);
      
      if (progress && currentRoundData) {
        const defeatedInRound = progress.opponentsDefeated[currentRound] || [];
        const allOpponentsDefeated = defeatedInRound.length === currentRoundData.opponents.length;
        
        if (allOpponentsDefeated) {
          // Complete the round
          completeRound(tournamentId, currentRound, currentRoundData.reward);
          newTournamentStats.roundsCompleted++;
          
          // Check for achievements
          checkTournamentAchievements(tournamentId, newTournamentStats, progress);
          
          // Show appropriate victory splash
          const updatedProgress = getTournamentProgress(tournamentId);
          if (updatedProgress?.completed) {
            // Tournament completed
            newTournamentStats.tournamentsCompleted++;
            
            // Check for perfect tournament
            const isPerfect = newTournamentStats.tournamentGamesWon === newTournamentStats.tournamentGamesPlayed;
            if (isPerfect) {
              newTournamentStats.perfectTournaments++;
            }
            
            // Calculate tournament completion time
            const tournamentTime = Date.now() - new Date(progress.startedAt).getTime();
            const tournamentMinutes = tournamentTime / (1000 * 60);
            if (newTournamentStats.fastestTournament === 0 || tournamentMinutes < newTournamentStats.fastestTournament) {
              newTournamentStats.fastestTournament = tournamentMinutes;
            }
            
            setVictoryState({
              show: true,
              type: 'tournament',
              tournamentName: tournament?.name || 'Torneo',
              reward: 'Campeón del Torneo',
              experienceGained: 150,
              levelUp: shouldLevelUp(150) ? { from: playerStats.playerLevel, to: playerStats.playerLevel + 1 } : undefined
            });
          } else {
            // Round completed
            setVictoryState({
              show: true,
              type: 'round',
              roundName: currentRoundData.name,
              reward: currentRoundData.reward,
              experienceGained: 75
            });
          }
        } else {
          // Match won, but round not completed
          setVictoryState({
            show: true,
            type: 'match',
            opponentName: opponentName,
            experienceGained: 50
          });
        }
      }
    }
    
    setTournamentStats(newTournamentStats);
  };
  
  const shouldLevelUp = (experienceGain: number): boolean => {
    const currentExp = playerStats.experience;
    const newExp = currentExp + experienceGain;
    const currentLevel = Math.floor(currentExp / 100) + 1;
    const newLevel = Math.floor(newExp / 100) + 1;
    return newLevel > currentLevel;
  };
  
  const checkTournamentAchievements = (tournamentId: string, stats: typeof tournamentStats, progress: TournamentProgress) => {
    const newAchievements = { ...achievements };
    let hasNewAchievements = false;
    
    // First tournament achievement
    if (stats.tournamentsCompleted >= 1 && !newAchievements.firstTournament.unlocked) {
      newAchievements.firstTournament.unlocked = true;
      hasNewAchievements = true;
      setAchievementPopup({
        icon: newAchievements.firstTournament.icon,
        title: newAchievements.firstTournament.name,
        description: newAchievements.firstTournament.description
      });
    }
    
    // Round master achievement
    if (stats.roundsCompleted >= 5 && !newAchievements.roundMaster.unlocked) {
      newAchievements.roundMaster.unlocked = true;
      hasNewAchievements = true;
      setAchievementPopup({
        icon: newAchievements.roundMaster.icon,
        title: newAchievements.roundMaster.name,
        description: newAchievements.roundMaster.description
      });
    }
    
    // Tournament champion achievement
    if (stats.tournamentsCompleted >= 3 && !newAchievements.tournamentChamp.unlocked) {
      newAchievements.tournamentChamp.unlocked = true;
      hasNewAchievements = true;
      setAchievementPopup({
        icon: newAchievements.tournamentChamp.icon,
        title: newAchievements.tournamentChamp.name,
        description: newAchievements.tournamentChamp.description
      });
    }
    
    // Perfect tournament achievement
    if (stats.perfectTournaments >= 1 && !newAchievements.perfectTournament.unlocked) {
      newAchievements.perfectTournament.unlocked = true;
      hasNewAchievements = true;
      setAchievementPopup({
        icon: newAchievements.perfectTournament.icon,
        title: newAchievements.perfectTournament.name,
        description: newAchievements.perfectTournament.description
      });
    }
    
    // Fast tournament achievement
    if (stats.fastestTournament > 0 && stats.fastestTournament <= 20 && !newAchievements.tournamentSpeedrun.unlocked) {
      newAchievements.tournamentSpeedrun.unlocked = true;
      hasNewAchievements = true;
      setAchievementPopup({
        icon: newAchievements.tournamentSpeedrun.icon,
        title: newAchievements.tournamentSpeedrun.name,
        description: newAchievements.tournamentSpeedrun.description
      });
    }
    
    if (hasNewAchievements) {
      setAchievements(newAchievements);
    }
  };
  
  // UI helpers
  const showNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const hideModal = () => {
    setModal(null);
  };

  // Render current screen
  const renderScreen = () => {
    // Handle dynamic tournament bracket screens
    if (currentScreen.startsWith('tournament-bracket-')) {
      const tournamentId = currentScreen.replace('tournament-bracket-', '');
      
      return (
        <DynamicTournamentBracket
          tournamentId={tournamentId}
          onNavigate={navigateTo}
          onStartMatch={startTournamentMatch}
          onSetActiveTournament={setActiveTournament}
        />
      );
    }
    
    switch (currentScreen) {
      case 'welcome-screen':
        return <WelcomeScreen onNavigate={navigateTo} />;
      case 'main-screen':
        return <MainScreen onNavigate={navigateTo} />;
      case 'setup-screen':
        return <SetupScreen onNavigate={navigateTo} gameSettings={gameSettings} setGameSettings={setGameSettings} gameState={gameState} setGameState={setGameState} onStartGame={startGame} />;
      case 'game-board':
        return <GameBoard
          onNavigate={navigateTo}
          gameState={gameState}
          setGameState={setGameState}
          gameSettings={gameSettings}
          isPaused={isPaused}
          onPause={() => setIsPaused(true)}
          onResume={() => setIsPaused(false)}
          onPlayCard={handlePlayCard}
          onCallTruco={handleCallTruco}
          onCallRetruco={handleCallRetruco}
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
        return <AchievementsScreen onNavigate={navigateTo} achievements={achievements} playerStats={playerStats} />;
      case 'settings-screen':
        return <SettingsScreen onNavigate={navigateTo} gameSettings={gameSettings} setGameSettings={setGameSettings} />;
      case 'tournaments-screen':
        return <TournamentsScreen onNavigate={navigateTo} onStartTournament={startTournamentWithOpponent} />;
      case 'tutorial-screen':
        return <TutorialScreen onNavigate={navigateTo} />;
      case 'test-screen':
        return <TestScreen onNavigate={navigateTo} />;
      case 'siete-medio-screen':
        return <SieteMedioScreen onNavigate={navigateTo} />;
      case 'brisca-screen':
        return <BriscaScreen onNavigate={navigateTo} />;
      case 'chinchon-screen':
        return <ChinchonScreen onNavigate={navigateTo} />;
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
          {(['game-board', 'siete-medio-screen', 'brisca-screen', 'chinchon-screen'].includes(currentScreen)) ? (
            <div className="game-canvas">
              {renderScreen()}
            </div>
          ) : (
            renderScreen()
          )}
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
      
      {victoryState.show && (
        <VictorySplash
          isVisible={victoryState.show}
          type={victoryState.type}
          opponentName={victoryState.opponentName}
          roundName={victoryState.roundName}
          tournamentName={victoryState.tournamentName}
          reward={victoryState.reward}
          levelUp={victoryState.levelUp}
          experienceGained={victoryState.experienceGained}
          onDismiss={() => {
            setVictoryState({ ...victoryState, show: false });
            // Navigate back
            if (victoryState.type === 'tournament') {
              navigateTo('tournaments-screen');
            } else if (activeTournament) {
              navigateTo(`tournament-bracket-${activeTournament.id}`);
            } else {
              navigateTo('main-screen');
            }
          }}
          autoHide={victoryState.autoHide !== undefined ? victoryState.autoHide : (victoryState.type !== 'tournament')}
          hideDelay={victoryState.type === 'round' ? 6000 : 5000}
        />
      )}
    </div>
  );
};

export default App;
