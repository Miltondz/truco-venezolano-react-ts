import React, { useState, useEffect } from 'react';
import { Tournament } from '../types';
import { getTournamentProgress, startTournament, setCurrentActiveTournament } from '../utils/tournamentStorage';
import TournamentBracketScreen from './TournamentBracketScreen';

interface DynamicTournamentBracketProps {
  tournamentId: string;
  onNavigate: (screen: string) => void;
  onStartMatch: (opponent: any) => void;
  onSetActiveTournament: (tournament: Tournament) => void;
}

const DynamicTournamentBracket: React.FC<DynamicTournamentBracketProps> = ({
  tournamentId,
  onNavigate,
  onStartMatch,
  onSetActiveTournament
}) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTournamentById = async (id: string): Promise<Tournament | null> => {
    try {
      const response = await fetch('/config/tournament_configuration.json');
      if (!response.ok) return null;
      const tournaments: Tournament[] = await response.json();
      
      // Add id based on name if not present
      const processedTournaments = tournaments.map(t => ({
        ...t,
        id: t.id || t.name.toLowerCase().replace(/\s+/g, '-')
      }));
      
      return processedTournaments.find(t => t.id === id) || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    loadTournamentById(tournamentId).then(t => {
      if (t) {
        setTournament(t);
        onSetActiveTournament(t);
        
        // Initialize tournament progress if not exists
        const progress = getTournamentProgress(t.id);
        if (!progress) {
          startTournament(t.id, t.name, t.rounds.length);
        }
        setCurrentActiveTournament(t.id);
      }
      setLoading(false);
    });
  }, [tournamentId, onSetActiveTournament]);

  if (loading) {
    return (
      <div className="screen active">
        <div className="screen-content">
          <h2 className="game-title">Cargando Torneo...</h2>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="screen active">
        <div className="screen-content">
          <h2 className="game-title">Torneo No Encontrado</h2>
          <button className="btn btn-secondary" onClick={() => onNavigate('tournaments-screen')}>
            Volver a Torneos
          </button>
        </div>
      </div>
    );
  }

  return (
    <TournamentBracketScreen
      tournament={tournament}
      onNavigate={onNavigate}
      onStartMatch={onStartMatch}
    />
  );
};

export default DynamicTournamentBracket;