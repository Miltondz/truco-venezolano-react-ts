import React, { useEffect, useState, useMemo } from 'react';
import { BaseScreenProps, Tournament, TournamentProgress, AICharacter } from '../types';
import { getTournamentProgress, defeatOpponent, getCurrentActiveTournament } from '../utils/tournamentStorage';

interface TournamentBracketScreenProps extends BaseScreenProps {
  tournament: Tournament;
  onStartMatch: (opponent: AICharacter) => void;
}

type AICharactersMap = Record<string, {
  agresividad: number;
  riesgo: number;
  blufeo: number;
  consistencia: number;
  personaje: string;
  description: string;
  avatar: string;
  activo: boolean;
}>;

interface ProcessedOpponent {
  name: string;
  avatar: string;
  defeated: boolean;
  active: boolean;
  aiCharacter?: AICharacter;
}

const TournamentBracketScreen: React.FC<TournamentBracketScreenProps> = ({ 
  onNavigate,
  tournament,
  onStartMatch
}) => {
  const [progress, setProgress] = useState<TournamentProgress | null>(null);
  const [characters, setCharacters] = useState<AICharactersMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextOpponent, setNextOpponent] = useState<AICharacter | null>(null);

  // Load tournament progress and AI characters
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load tournament progress
        const tournamentProgress = getTournamentProgress(tournament.id);
        setProgress(tournamentProgress);
        
        // Load AI characters
        const response = await fetch('/config/ai_characters.json');
        if (!response.ok) throw new Error('Failed to load AI characters');
        const aiData = await response.json();
        setCharacters(aiData);
        
      } catch (err: any) {
        setError(err.message || 'Error loading tournament data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [tournament.id]);

  // Helper functions
  const derivePersonality = (c: AICharactersMap[string]): 'balanced' | 'aggressive' | 'conservative' | 'unpredictable' => {
    const { agresividad, blufeo, consistencia, riesgo } = c;
    if (agresividad >= 8 && blufeo >= 7) return 'aggressive';
    if (blufeo >= 8 && riesgo >= 7) return 'unpredictable';
    if (consistencia >= 8 && agresividad <= 4) return 'conservative';
    return 'balanced';
  };

  const deriveDifficulty = (c: AICharactersMap[string]): 'easy' | 'medium' | 'intermediate' | 'hard' | 'master' => {
    const avg = (c.agresividad + c.riesgo + c.blufeo + c.consistencia) / 4;
    if (avg <= 3.5) return 'easy';
    if (avg <= 5.0) return 'medium';
    if (avg <= 6.5) return 'intermediate';
    if (avg <= 8.0) return 'hard';
    return 'master';
  };

  const toAICharacter = (name: string, c: AICharactersMap[string]): AICharacter => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[^\w-]/g, '');
    return {
      id: slug,
      name,
      agresividad: c.agresividad,
      riesgo: c.riesgo,
      blufeo: c.blufeo,
      consistencia: c.consistencia,
      description: c.description,
      avatar: c.avatar,
      activo: c.activo,
      difficulty: deriveDifficulty(c),
      personality: derivePersonality(c)
    };
  };

  // Process rounds with current progress
  const processedRounds = useMemo(() => {
    if (!progress || !characters) return [];
    
    return tournament.rounds.map((round, index) => {
      const roundNumber = index + 1;
      const isCompleted = progress.roundsCompleted[index] || false;
      const isCurrent = progress.currentRound === roundNumber;
      const defeatedInRound = progress.opponentsDefeated[roundNumber] || [];
      
      const processedOpponents: ProcessedOpponent[] = round.opponents.map(opponentName => {
        const character = characters[opponentName];
        const defeated = defeatedInRound.includes(opponentName);
        const active = isCurrent && !defeated && defeatedInRound.length === round.opponents.indexOf(opponentName);
        
        return {
          name: opponentName,
          avatar: character?.avatar || 'avatar1-default.jpg',
          defeated,
          active,
          aiCharacter: character ? toAICharacter(opponentName, character) : undefined
        };
      });
      
      // Find next opponent
      if (isCurrent && !nextOpponent) {
        const next = processedOpponents.find(opp => opp.active);
        if (next?.aiCharacter) {
          setNextOpponent(next.aiCharacter);
        }
      }
      
      return {
        ...round,
        roundNumber,
        isCompleted,
        isCurrent,
        opponents: processedOpponents
      };
    });
  }, [tournament, progress, characters, nextOpponent]);

  const handleStartMatch = () => {
    if (nextOpponent) {
      onStartMatch(nextOpponent);
    } else {
      alert('No hay oponente disponible para enfrentar.');
    }
  };

  const handleBackToTournaments = () => {
    onNavigate('tournaments-screen');
  };

  if (loading) {
    return (
      <div id="tournament-bracket-screen" className="screen active">
        <button className="back-button" onClick={handleBackToTournaments}>
          ← Volver a Torneos
        </button>
        <div className="screen-content">
          <h2 className="game-title">Cargando Torneo...</h2>
          <p>Obteniendo progreso del torneo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="tournament-bracket-screen" className="screen active">
        <button className="back-button" onClick={handleBackToTournaments}>
          ← Volver a Torneos
        </button>
        <div className="screen-content">
          <h2 className="game-title">Error</h2>
          <p style={{ color: 'var(--danger-color)' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div id="tournament-bracket-screen" className="screen active">
        <button className="back-button" onClick={handleBackToTournaments}>
          ← Volver a Torneos
        </button>
        <div className="screen-content">
          <h2 className="game-title">{tournament.name}</h2>
          <p>No has comenzado este torneo aún.</p>
          <button className="btn btn-primary" onClick={handleBackToTournaments}>
            Volver a Torneos
          </button>
        </div>
      </div>
    );
  }

  const totalRounds = tournament.rounds.length;
  const currentRoundNumber = progress.currentRound;

  return (
    <div id="tournament-bracket-screen" className="screen active">
      <button className="back-button" onClick={handleBackToTournaments}>
        ← Volver a Torneos
      </button>

      <div className="screen-content">
        <h2 className="game-title">{tournament.name}</h2>
        <div className="game-subtitle">
          {progress.completed 
            ? `Torneo Completado 🏆` 
            : `Ronda ${currentRoundNumber} de ${totalRounds}`
          }
        </div>

        <div className="stats-grid">
          {processedRounds.map((round) => (
            <div 
              key={round.roundNumber} 
              className={`stat-card ${round.isCurrent ? 'tournament-current-round' : ''} ${round.isCompleted ? 'tournament-completed-round' : ''}`}
              style={{
                border: round.isCurrent ? '2px solid #FF9800' : round.isCompleted ? '2px solid #4CAF50' : '2px solid rgba(0, 255, 255, 0.3)',
                background: round.isCurrent ? 'rgba(255, 152, 0, 0.1)' : round.isCompleted ? 'rgba(76, 175, 80, 0.1)' : undefined
              }}
            >
              <div className="stat-title">
                RONDA {round.roundNumber}: {round.name}
                {round.isCurrent && <span style={{ marginLeft: '10px', color: '#FF9800' }}>▶ ACTUAL</span>}
                {round.isCompleted && <span style={{ marginLeft: '10px', color: '#4CAF50' }}>✓ COMPLETA</span>}
              </div>
              <div className="stat-description">
                Recompensa: 🏅 {round.reward}
              </div>
              <div className="stat-value" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                {round.opponents.map((opponent, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      border: opponent.active ? '2px solid #FF9800' : opponent.defeated ? '2px solid #4CAF50' : '2px solid #666',
                      borderRadius: '8px',
                      background: opponent.active ? 'rgba(255, 152, 0, 0.2)' : opponent.defeated ? 'rgba(76, 175, 80, 0.2)' : 'rgba(102, 102, 102, 0.1)',
                      fontSize: '0.9rem',
                      filter: opponent.defeated ? 'grayscale(70%)' : 'none',
                      opacity: opponent.defeated ? 0.7 : 1
                    }}
                  >
                    <img 
                      src={`/images/avatars/${opponent.avatar}`}
                      alt={opponent.name}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = '/images/avatars/avatar1-default.jpg';
                      }}
                    />
                    <span style={{ color: opponent.active ? '#FF9800' : opponent.defeated ? '#4CAF50' : '#fff' }}>
                      {opponent.name}
                    </span>
                    {opponent.defeated && <span style={{ color: '#4CAF50' }}>✓</span>}
                    {opponent.active && <span style={{ color: '#FF9800' }}>▶</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {!progress.completed && nextOpponent && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              className="btn btn-primary"
              onClick={handleStartMatch}
              style={{ fontSize: '1.1rem', padding: '12px 24px' }}
            >
              ⚔️ Enfrentar a {nextOpponent.name}
            </button>
            <div style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Derrota a todos los oponentes para completar el torneo
            </div>
          </div>
        )}
        
        {progress.completed && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <div style={{ 
              padding: '20px', 
              border: '2px solid gold', 
              borderRadius: '10px', 
              background: 'rgba(255, 215, 0, 0.1)',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: 'gold', margin: '0 0 10px 0' }}>🏆 ¡TORNEO COMPLETADO!</h3>
              <p style={{ margin: '0', color: 'var(--text-primary)' }}>Felicidades por completar {tournament.name}</p>
              {progress.rewards.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Recompensas obtenidas:</strong>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '5px 0 0 0' }}>
                    {progress.rewards.map((reward, i) => (
                      <li key={i} style={{ margin: '2px 0' }}>🏅 {reward}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button 
              className="btn btn-secondary"
              onClick={handleBackToTournaments}
              style={{ fontSize: '1.1rem', padding: '12px 24px' }}
            >
              Volver a Torneos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentBracketScreen;