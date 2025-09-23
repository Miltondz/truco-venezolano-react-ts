// Game data types
import React from 'react';
export interface Card {
  suit: string;
  value: number;
  name: string;
  power: number;
  image: string;
  envidoValue: number;
  imageFile: string;
}

export interface GameState {
  playerScore: number;
  computerScore: number;
  currentRound: number;
  maxRounds: number;
  playerHand: Card[];
  computerHand: Card[];
  playerPlayedCard: Card | null;
  computerPlayedCard: Card | null;
  isPlayerTurn: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'master';
  aiPersonality: 'balanced' | 'aggressive' | 'conservative' | 'unpredictable';
  activeCalls: string[];
  roundsWon: { player: number; computer: number };
  gameInProgress: boolean;
  handInProgress: boolean;
  currentTrucoLevel: number;
  currentEnvidoLevel: number;
  playerEnvidoPoints: number;
  computerEnvidoPoints: number;
  playerHasFlor: boolean;
  computerHasFlor: boolean;
  waitingForResponse: boolean;
  lastCall: string | null;
  gameStartTime: number;
  currentStreak: number;
  bestStreak: number;
  selectedAvatar: string;
}

export interface GameSettings {
  soundEffectsEnabled: boolean;
  backgroundMusicEnabled: boolean;
  masterVolume: number;
  effectsVolume: number;
  musicVolume: number;
  animationsEnabled: boolean;
  confirmMoves: boolean;
  showHints: boolean;
  autoPlay: boolean;
  gameSpeed: number;
  darkMode: boolean;
  particlesEnabled: boolean;
  hdCards: boolean;
  showCardPower: boolean;
  handStrengthIndicator: boolean;
  showAiThinking: boolean;
  aiResponseTime: number;
  aiPersonality: 'balanced' | 'aggressive' | 'conservative' | 'unpredictable';
  largeText: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  voiceNarration: boolean;
  autoSave: boolean;
  cloudSync: boolean;
  selectedDeck: string;
  selectedBoard: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  trucosCalled: number;
  trucosWon: number;
  envidosCalled: number;
  envidosWon: number;
  floresAchieved: number;
  totalPoints: number;
  bestStreak: number;
  currentStreak: number;
  timePlayed: number;
  playerLevel: number;
  experience: number;
}

export interface Achievement {
  unlocked: boolean;
  name: string;
  description: string;
  icon: string;
}

export interface TutorialStep {
  target: string;
  title: string;
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface NotificationData {
  message: string;
  type: 'info' | 'success' | 'error';
}

export interface ModalData {
  title: string;
  message: string;
  onConfirm?: () => void;
}

export interface AchievementData {
  icon: string;
  title: string;
  description: string;
}

// Component props types
export interface CardProps {
  card: Card | null;
  faceUp?: boolean;
  onClick?: () => void;
  className?: string;
  showPower?: boolean;
}

export interface BaseScreenProps {
  onNavigate: (screen: string) => void;
}

export interface ScreenProps extends BaseScreenProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  gameSettings: GameSettings;
  setGameSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  playerStats: PlayerStats;
  setPlayerStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  achievements: Record<string, Achievement>;
  setAchievements: React.Dispatch<React.SetStateAction<Record<string, Achievement>>>;
}

export interface GameBoardProps extends BaseScreenProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  gameSettings: GameSettings;
  onPlayCard: (cardIndex: number) => void;
  onCallTruco: () => void;
  onCallRetruco: () => void;
  onCallVale4: () => void;
  onCallEnvido: () => void;
  onAcceptCall: () => void;
  onRejectCall: () => void;
  onCallFlor: () => void;
  onFoldHand: () => void;
}

// Audio types
export interface SoundEffects {
  [key: string]: () => void;
}

// Constants
export const DECKS = ['default', 'europea', 'moderna', 'especial'];
export const BOARDS = ['tablero-cama.jpg', 'tablero-mesa.jpg', 'tablero-grama.jpg', 'tablero-salon.jpg'];
export const AVATARS = ['avatar1.jpg', 'avatar2.jpg', 'avatar3.jpg', 'avatar4.jpg', 'avatar5.jpg', 'avatar6.jpg', 'avatar7.jpg'];

// Suit mapping for file names
export const suitFileMap: Record<string, string> = {
  espadas: 'espadas',
  bastos: 'treboles',
  oros: 'diamantes',
  copas: 'corazones'
};