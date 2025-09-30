import { TournamentProgress, TournamentState } from '../types';

// Keys for localStorage
const TOURNAMENT_STATE_KEY = 'truco-tournament-state';
const TOURNAMENT_PROGRESS_KEY = 'truco-tournament-progress';

// Default tournament state
const createDefaultTournamentState = (): TournamentState => ({
  availableTournaments: [],
  activeProgress: {},
  completedTournaments: [],
  currentActiveTournament: undefined
});

// Load tournament state from localStorage
export const loadTournamentState = (): TournamentState => {
  try {
    const saved = localStorage.getItem(TOURNAMENT_STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...createDefaultTournamentState(),
        ...parsed
      };
    }
  } catch (error) {
    console.warn('Error loading tournament state:', error);
  }
  return createDefaultTournamentState();
};

// Save tournament state to localStorage
export const saveTournamentState = (state: TournamentState): void => {
  try {
    // Don't save availableTournaments as they come from JSON config
    const toSave = {
      activeProgress: state.activeProgress,
      completedTournaments: state.completedTournaments,
      currentActiveTournament: state.currentActiveTournament
    };
    localStorage.setItem(TOURNAMENT_STATE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('Error saving tournament state:', error);
  }
};

// Start a new tournament
export const startTournament = (
  tournamentId: string,
  tournamentName: string,
  totalRounds: number
): TournamentProgress => {
  const progress: TournamentProgress = {
    tournamentId,
    tournamentName,
    currentRound: 1,
    roundsCompleted: new Array(totalRounds).fill(false),
    opponentsDefeated: {},
    completed: false,
    startedAt: new Date().toISOString(),
    rewards: [],
    lastPlayedAt: new Date().toISOString()
  };

  // Load current state, add new progress, and save
  const currentState = loadTournamentState();
  currentState.activeProgress[tournamentId] = progress;
  currentState.currentActiveTournament = tournamentId;
  saveTournamentState(currentState);

  return progress;
};

// Update tournament progress
export const updateTournamentProgress = (
  tournamentId: string,
  updates: Partial<TournamentProgress>
): TournamentProgress | null => {
  const currentState = loadTournamentState();
  const existing = currentState.activeProgress[tournamentId];
  
  if (!existing) {
    console.warn(`Tournament progress not found: ${tournamentId}`);
    return null;
  }

  const updated = {
    ...existing,
    ...updates,
    lastPlayedAt: new Date().toISOString()
  };

  currentState.activeProgress[tournamentId] = updated;
  
  // If tournament completed, move to completed list
  if (updated.completed && !currentState.completedTournaments.includes(tournamentId)) {
    currentState.completedTournaments.push(tournamentId);
    updated.completedAt = new Date().toISOString();
    
    // Remove from active progress if fully completed
    delete currentState.activeProgress[tournamentId];
    
    // Clear current active if this was it
    if (currentState.currentActiveTournament === tournamentId) {
      currentState.currentActiveTournament = undefined;
    }
  }

  saveTournamentState(currentState);
  return updated;
};

// Mark opponent as defeated in current round
export const defeatOpponent = (
  tournamentId: string,
  roundNumber: number,
  opponentName: string
): boolean => {
  const currentState = loadTournamentState();
  const progress = currentState.activeProgress[tournamentId];
  
  if (!progress) return false;

  // Initialize round if needed
  if (!progress.opponentsDefeated[roundNumber]) {
    progress.opponentsDefeated[roundNumber] = [];
  }

  // Add opponent to defeated list if not already there
  if (!progress.opponentsDefeated[roundNumber].includes(opponentName)) {
    progress.opponentsDefeated[roundNumber].push(opponentName);
  }

  progress.lastPlayedAt = new Date().toISOString();
  
  saveTournamentState(currentState);
  return true;
};

// Complete current round
export const completeRound = (
  tournamentId: string,
  roundNumber: number,
  reward?: string
): boolean => {
  const currentState = loadTournamentState();
  const progress = currentState.activeProgress[tournamentId];
  
  if (!progress) return false;

  // Mark round as completed
  progress.roundsCompleted[roundNumber - 1] = true;
  
  // Add reward if provided
  if (reward && !progress.rewards.includes(reward)) {
    progress.rewards.push(reward);
  }

  // Check if all rounds completed
  const allRoundsCompleted = progress.roundsCompleted.every(completed => completed);
  if (allRoundsCompleted) {
    progress.completed = true;
    progress.completedAt = new Date().toISOString();
    
    // Move to completed tournaments
    currentState.completedTournaments.push(tournamentId);
    delete currentState.activeProgress[tournamentId];
    
    if (currentState.currentActiveTournament === tournamentId) {
      currentState.currentActiveTournament = undefined;
    }
  } else {
    // Move to next round
    progress.currentRound = roundNumber + 1;
  }

  progress.lastPlayedAt = new Date().toISOString();
  saveTournamentState(currentState);
  return true;
};

// Get tournament progress
export const getTournamentProgress = (tournamentId: string): TournamentProgress | null => {
  const currentState = loadTournamentState();
  return currentState.activeProgress[tournamentId] || null;
};

// Get all active tournament progress
export const getAllActiveTournaments = (): Record<string, TournamentProgress> => {
  const currentState = loadTournamentState();
  return currentState.activeProgress;
};

// Check if tournament is completed
export const isTournamentCompleted = (tournamentId: string): boolean => {
  const currentState = loadTournamentState();
  return currentState.completedTournaments.includes(tournamentId);
};

// Set current active tournament
export const setCurrentActiveTournament = (tournamentId: string): void => {
  const currentState = loadTournamentState();
  currentState.currentActiveTournament = tournamentId;
  saveTournamentState(currentState);
};

// Get current active tournament
export const getCurrentActiveTournament = (): string | undefined => {
  const currentState = loadTournamentState();
  return currentState.currentActiveTournament;
};

// Reset tournament progress (for debugging/testing)
export const resetTournamentProgress = (tournamentId: string): boolean => {
  const currentState = loadTournamentState();
  
  // Remove from active progress
  delete currentState.activeProgress[tournamentId];
  
  // Remove from completed tournaments
  const completedIndex = currentState.completedTournaments.indexOf(tournamentId);
  if (completedIndex !== -1) {
    currentState.completedTournaments.splice(completedIndex, 1);
  }
  
  // Clear current active if this was it
  if (currentState.currentActiveTournament === tournamentId) {
    currentState.currentActiveTournament = undefined;
  }
  
  saveTournamentState(currentState);
  return true;
};

// Clear all tournament progress (reset everything)
export const clearAllTournamentProgress = (): void => {
  try {
    localStorage.removeItem(TOURNAMENT_STATE_KEY);
    localStorage.removeItem(TOURNAMENT_PROGRESS_KEY);
  } catch (error) {
    console.error('Error clearing tournament progress:', error);
  }
};