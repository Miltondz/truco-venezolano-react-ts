import React from 'react';
import { BaseScreenProps, Achievement, PlayerStats } from '../types';

interface AchievementsScreenProps extends BaseScreenProps {
  achievements: Record<string, Achievement>;
  playerStats: PlayerStats;
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ onNavigate, achievements, playerStats }) => {
  const winPercentage = playerStats.gamesPlayed > 0
    ? Math.round((playerStats.gamesWon / playerStats.gamesPlayed) * 100)
    : 0;

  return (
    <div id="achievements-screen" className="screen active">
      <button className="back-button" onClick={() => onNavigate('main-screen')}>← Volver</button>
      <div className="screen-content">
        <h2 className="game-title">Logros</h2>
        <div className="stats-grid" id="achievements-grid">
          {Object.entries(achievements).map(([key, achievement]) => (
            <div key={key} className={`stat-card ${achievement.unlocked ? 'unlocked' : 'locked'}`} style={{ opacity: achievement.unlocked ? 1 : 0.5 }}>
              <div className="stat-title">{achievement.icon} {achievement.name}</div>
              <div className="stat-description">{achievement.description}</div>
              <div className="stat-value">{achievement.unlocked ? '✅ Desbloqueado' : '🔒 Bloqueado'}</div>
            </div>
          ))}
        </div>

        <h2 className="game-title" style={{ marginTop: '2rem' }}>Estadísticas</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Partidas Jugadas</div>
            <div className="stat-value">{playerStats.gamesPlayed}</div>
            <div className="stat-description">Total de partidas completadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Partidas Ganadas</div>
            <div className="stat-value">{playerStats.gamesWon}</div>
            <div className="stat-description">Victorias conseguidas</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Porcentaje de Victoria</div>
            <div className="stat-value">{winPercentage}%</div>
            <div className="stat-description">Ratio de éxito general</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Trucos Cantados</div>
            <div className="stat-value">{playerStats.trucosCalled}</div>
            <div className="stat-description">Veces que cantaste truco</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsScreen;
