import React, { useEffect, useMemo, useState } from 'react';
import { BaseScreenProps, AICharacter } from '../types';
import { AICharactersMap, loadAICharacters } from '../utils/aiCharactersLoader';

interface TournamentsScreenProps extends BaseScreenProps {
  onStartTournament: (opponent: AICharacter) => void;
}

type TournamentRound = {
  round: number;
  name: string;
  difficulty: string;
  opponents: string[];
  unlockNext: boolean;
  reward: string;
};

type Tournament = {
  name: string;
  description: string;
  activo: boolean;
  rounds: TournamentRound[];
  rules?: Record<string, string | number>;
  unlockConditions?: Record<string, string>;
};

const TournamentsScreen: React.FC<TournamentsScreenProps> = ({ onNavigate, onStartTournament }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [characters, setCharacters] = useState<AICharactersMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadConfigs() {
      try {
        setLoading(true);
        setError(null);
        const [tRes, cData] = await Promise.all([
          fetch('/config/tournament_configuration.json', { cache: 'no-cache' }),
          loadAICharacters()
        ]);
        if (!tRes.ok) throw new Error(`Torneos HTTP ${tRes.status}`);
        const tData = await tRes.json();
        if (!Array.isArray(tData)) throw new Error('Formato de torneos inválido');
        if (!isMounted) return;
        setTournaments(tData as Tournament[]);
        setCharacters(cData as AICharactersMap);
      } catch (e: unknown) {
        if (isMounted) setError(e instanceof Error ? e.message : 'Error cargando configuraciones');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadConfigs();
    return () => { isMounted = false; };
  }, []);

  const aiNames = useMemo(() => new Set(Object.keys(characters)), [characters]);

  const validation = useMemo(() => {
    const result: Record<string, string[]> = {};
    tournaments.forEach(t => {
      const missing: string[] = [];
      t.rounds?.forEach(r => {
        r.opponents?.forEach(name => {
          if (!aiNames.has(name)) missing.push(name);
        });
      });
      if (missing.length > 0) result[t.name] = Array.from(new Set(missing));
    });
    return result;
  }, [tournaments, aiNames]);

  const handleSelect = (t: Tournament) => {
    const missing = validation[t.name] || [];
    if (missing.length > 0) {
      alert(`No puedes iniciar este torneo aún. Oponentes faltantes en configuración AI:\n- ${missing.join('\n- ')}`);
      return;
    }
    // Navigate to tournament bracket instead of starting immediately
    onNavigate(`tournament-bracket-${t.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const active = tournaments.filter(t => t.activo);
  const inactive = tournaments.filter(t => !t.activo);

  return (
    <div id="tournaments-screen" className="screen active">
      <button className="back-button" onClick={() => onNavigate('main-screen')}>← Volver</button>
      <div className="screen-content">
        <h2 className="game-title">Seleccionar Torneo</h2>
        {loading && <p>Cargando torneos...</p>}
        {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}

        {!loading && !error && (
          <>
            <div className="tournaments-card-grid">
              {active.map(t => (
                <div 
                  key={t.name} 
                  className="tournament-card"
                  onClick={() => handleSelect(t)}
                  style={{
                    cursor: 'pointer',
                    opacity: validation[t.name]?.length ? 0.7 : 1,
                    pointerEvents: validation[t.name]?.length ? 'none' : 'auto'
                  }}
                >
                  <div className="tournament-card-header">
                    <div className="tournament-icon">🏆</div>
                    <div className="tournament-status active-status">✓ Disponible</div>
                  </div>
                  
                  <div className="tournament-card-body">
                    <h3 className="tournament-card-title">{t.name}</h3>
                    <p className="tournament-card-description">{t.description}</p>
                    
                    <div className="tournament-card-stats">
                      <div className="tournament-stat-item">
                        <span className="stat-icon">🎯</span>
                        <span className="stat-label">Rondas</span>
                        <span className="stat-number">{t.rounds?.length ?? 0}</span>
                      </div>
                      <div className="tournament-stat-item">
                        <span className="stat-icon">⚔️</span>
                        <span className="stat-label">Oponentes</span>
                        <span className="stat-number">
                          {t.rounds?.reduce((sum, r) => sum + (r.opponents?.length || 0), 0) || 0}
                        </span>
                      </div>
                    </div>
                    
                    {validation[t.name]?.length ? (
                      <div className="tournament-warning">
                        ⚠️ Faltan {validation[t.name].length} oponentes
                      </div>
                    ) : (
                      <div className="tournament-action">
                        <span>🎮 Jugar Torneo</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="tournament-card-footer">
                    <span className="tournament-difficulty">
                      {t.rounds?.[0]?.difficulty || 'Variado'}
                    </span>
                  </div>
                </div>
              ))}
              
              {inactive.map(t => (
                <div 
                  key={t.name} 
                  className="tournament-card tournament-card-locked"
                  style={{ cursor: 'not-allowed', opacity: 0.5 }}
                >
                  <div className="tournament-card-header">
                    <div className="tournament-icon">🔒</div>
                    <div className="tournament-status locked-status">Bloqueado</div>
                  </div>
                  
                  <div className="tournament-card-body">
                    <h3 className="tournament-card-title">{t.name}</h3>
                    <p className="tournament-card-description">{t.description}</p>
                    
                    <div className="tournament-locked-message">
                      <span>🔒 Próximamente</span>
                    </div>
                  </div>
                  
                  <div className="tournament-card-footer">
                    <span className="tournament-difficulty">???</span>
                  </div>
                </div>
              ))}
            </div>

            {Object.keys(validation).length > 0 && (
              <div className="tournaments-validation-warnings" style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                background: 'rgba(255, 165, 0, 0.1)', 
                border: '2px solid rgba(255, 165, 0, 0.3)', 
                borderRadius: '8px',
                fontSize: '0.85rem',
                maxWidth: '600px',
                margin: '1.5rem auto 0'
              }}>
                <h4 style={{ color: 'var(--warning-color)', marginBottom: '0.5rem', fontSize: '1rem' }}>
                  ⚠️ Advertencias de configuración
                </h4>
                {Object.entries(validation).map(([tName, missing]) => (
                  <div key={tName} style={{ marginTop: '0.3rem', paddingLeft: '0.5rem' }}>
                    <strong>{tName}:</strong> Faltan oponentes: {missing.join(', ')}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TournamentsScreen;
