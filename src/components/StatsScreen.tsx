import React from 'react';
import { BaseScreenProps, PlayerStats } from '../types';

interface StatsScreenProps extends BaseScreenProps {
  playerStats: PlayerStats;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ onNavigate, playerStats }) => {
  const winPercentage = playerStats.gamesPlayed > 0
    ? Math.round((playerStats.gamesWon / playerStats.gamesPlayed) * 100)
    : 0;

  return (
    <div id="stats-screen" className="screen active">
      <button className="back-button" onClick={() => onNavigate('main-screen')}>← Volver</button>
      <div className="screen-content">
        <h2 className="game-title">Estadísticas</h2>
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

export default StatsScreen;