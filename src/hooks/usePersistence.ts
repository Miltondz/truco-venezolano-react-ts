import { useEffect, useState } from 'react';
import { GameSettings, PlayerStats, Achievement } from '../types';
import { loadSettings, saveSettings, loadStats, saveStats, loadAchievements, saveAchievements } from '../utils/storage';
import { initializeAudio } from '../utils/sound';

const DEFAULT_SETTINGS: GameSettings = {
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
};

const DEFAULT_STATS: PlayerStats = {
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
};

const DEFAULT_ACHIEVEMENTS: Record<string, Achievement> = {
  firstWin: { unlocked: false, name: "Primera Victoria", description: "Gana tu primera partida", icon: "🏆" },
  trucoMaster: { unlocked: false, name: "Maestro del Truco", description: "Gana 10 trucos", icon: "⚡" },
  envidoExpert: { unlocked: false, name: "Experto en Envido", description: "Gana 10 envidos", icon: "🎵" },
  florCollector: { unlocked: false, name: "Coleccionista de Flores", description: "Consigue 5 flores", icon: "🌸" },
  winStreak5: { unlocked: false, name: "Racha de 5", description: "Gana 5 partidas seguidas", icon: "🔥" },
  winStreak10: { unlocked: false, name: "Racha de 10", description: "Gana 10 partidas seguidas", icon: "🔥🔥" },
  perfectGame: { unlocked: false, name: "Juego Perfecto", description: "Gana 30-0", icon: "📎" },
  speedster: { unlocked: false, name: "Velocista", description: "Gana en menos de 5 minutos", icon: "⚡" },
  veteran: { unlocked: false, name: "Veterano", description: "Juega 100 partidas", icon: "🎖️" },
  levelUp: { unlocked: false, name: "Subida de Nivel", description: "Alcanza el nivel 10", icon: "⭐" },
  firstTournament: { unlocked: false, name: "Primer Torneo", description: "Completa tu primer torneo", icon: "🏅" },
  roundMaster: { unlocked: false, name: "Maestro de Rondas", description: "Completa 5 rondas de torneo", icon: "🎯" },
  tournamentChamp: { unlocked: false, name: "Campeón de Torneos", description: "Gana 3 torneos diferentes", icon: "👑" },
  perfectTournament: { unlocked: false, name: "Torneo Perfecto", description: "Completa un torneo sin perder ningún juego", icon: "🏆" },
  tournamentSpeedrun: { unlocked: false, name: "Torneo Rápido", description: "Completa un torneo en menos de 20 minutos", icon: "⏱️" }
};

export function usePersistence() {
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(DEFAULT_STATS);
  const [achievements, setAchievements] = useState<Record<string, Achievement>>(DEFAULT_ACHIEVEMENTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadSettings();
    if (saved) setGameSettings(saved);

    const stats = loadStats();
    if (stats) setPlayerStats(stats);

    const achs = loadAchievements();
    if (achs) setAchievements(achs);

    initializeAudio();
    setReady(true);
  }, []);

  // Auto-save on change
  useEffect(() => {
    if (!ready) return;
    if (gameSettings.autoSave) {
      saveSettings(gameSettings);
      saveStats(playerStats);
      saveAchievements(achievements);
    }
  }, [gameSettings, playerStats, achievements, ready]);

  return { gameSettings, setGameSettings, playerStats, setPlayerStats, achievements, setAchievements, ready };
}
