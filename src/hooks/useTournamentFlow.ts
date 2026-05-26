import { useState } from 'react';
import { Tournament, TournamentProgress, Achievement, AICharacter } from '../types';
import { getTournamentProgress, defeatOpponent, completeRound } from '../utils/tournamentStorage';

export type TournamentStats = {
  tournamentsCompleted: number;
  roundsCompleted: number;
  perfectTournaments: number;
  fastestTournament: number;
  tournamentGamesWon: number;
  tournamentGamesPlayed: number;
};

const DEFAULT_TOURNAMENT_STATS: TournamentStats = {
  tournamentsCompleted: 0,
  roundsCompleted: 0,
  perfectTournaments: 0,
  fastestTournament: 0,
  tournamentGamesWon: 0,
  tournamentGamesPlayed: 0
};

export function useTournamentFlow(
  availableTournaments: Tournament[],
  activeTournament: Tournament | null,
  playerLevel: number,
  achievements: Record<string, Achievement>,
  setAchievements: (a: Record<string, Achievement>) => void,
  showAchievementPopup: (icon: string, title: string, description: string) => void
) {
  const [tournamentStats, setTournamentStats] = useState<TournamentStats>(DEFAULT_TOURNAMENT_STATS);

  const shouldLevelUp = (experienceGain: number, currentExp: number): boolean => {
    const newExp = currentExp + experienceGain;
    const currentLevel = Math.floor(currentExp / 100) + 1;
    const newLevel = Math.floor(newExp / 100) + 1;
    return newLevel > currentLevel;
  };

  const checkTournamentAchievements = (
    stats: TournamentStats,
    _progress: TournamentProgress
  ) => {
    const newAchievements = { ...achievements };
    let hasNew = false;

    const unlock = (key: string) => {
      if (!newAchievements[key].unlocked) {
        newAchievements[key].unlocked = true;
        hasNew = true;
        showAchievementPopup(newAchievements[key].icon, newAchievements[key].name, newAchievements[key].description);
      }
    };

    if (stats.tournamentsCompleted >= 1) unlock('firstTournament');
    if (stats.roundsCompleted >= 5) unlock('roundMaster');
    if (stats.tournamentsCompleted >= 3) unlock('tournamentChamp');
    if (stats.perfectTournaments >= 1) unlock('perfectTournament');
    if (stats.fastestTournament > 0 && stats.fastestTournament <= 20) unlock('tournamentSpeedrun');

    if (hasNew) setAchievements(newAchievements);
  };

  const handleTournamentGameEnd = (
    playerWon: boolean,
    tournamentId: string | undefined,
    currentRound: number | undefined,
    opponentName: string | undefined,
    currentExp: number,
    onVictoryState: (state: {
      show: boolean; type: 'match' | 'round' | 'tournament';
      opponentName?: string; roundName?: string; tournamentName?: string;
      reward?: string; levelUp?: { from: number; to: number }; experienceGained?: number;
    }) => void
  ) => {
    if (!tournamentId || !currentRound || !opponentName) return;

    const newStats = { ...tournamentStats };
    newStats.tournamentGamesPlayed++;

    if (playerWon) {
      newStats.tournamentGamesWon++;
      defeatOpponent(tournamentId, currentRound, opponentName);

      const progress = getTournamentProgress(tournamentId);
      const tournament = availableTournaments.find(t => t.id === tournamentId);
      const currentRoundData = tournament?.rounds.find(r => r.round === currentRound);

      if (progress && currentRoundData) {
        const defeatedInRound = progress.opponentsDefeated[currentRound] || [];
        const allOpponentsDefeated = defeatedInRound.length === currentRoundData.opponents.length;

        if (allOpponentsDefeated) {
          completeRound(tournamentId, currentRound, currentRoundData.reward);
          newStats.roundsCompleted++;
          checkTournamentAchievements(newStats, progress);

          const updatedProgress = getTournamentProgress(tournamentId);
          if (updatedProgress?.completed) {
            newStats.tournamentsCompleted++;
            const isPerfect = newStats.tournamentGamesWon === newStats.tournamentGamesPlayed;
            if (isPerfect) newStats.perfectTournaments++;

            const tournamentTime = Date.now() - new Date(progress.startedAt).getTime();
            const tournamentMinutes = tournamentTime / (1000 * 60);
            if (newStats.fastestTournament === 0 || tournamentMinutes < newStats.fastestTournament) {
              newStats.fastestTournament = tournamentMinutes;
            }

            onVictoryState({
              show: true, type: 'tournament',
              tournamentName: tournament?.name || 'Torneo',
              reward: 'Campeón del Torneo',
              experienceGained: 150,
              levelUp: shouldLevelUp(150, currentExp) ? { from: playerLevel, to: playerLevel + 1 } : undefined
            });
          } else {
            onVictoryState({
              show: true, type: 'round',
              roundName: currentRoundData.name,
              reward: currentRoundData.reward,
              experienceGained: 75
            });
          }
        } else {
          onVictoryState({ show: true, type: 'match', opponentName, experienceGained: 50 });
        }
      }
    }

    setTournamentStats(newStats);
    return newStats;
  };

  const loadTournamentById = async (tournamentId: string): Promise<Tournament | null> => {
    try {
      const response = await fetch('/config/tournament_configuration.json');
      if (!response.ok) return null;
      const tournaments: Tournament[] = await response.json();
      const processed = tournaments.map(t => ({
        ...t,
        id: t.id || t.name.toLowerCase().replace(/\s+/g, '-')
      }));
      return processed.find(t => t.id === tournamentId) || null;
    } catch {
      return null;
    }
  };

  return { tournamentStats, handleTournamentGameEnd, loadTournamentById };
}
