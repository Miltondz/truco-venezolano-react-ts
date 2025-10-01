import React from 'react';
import { BaseScreenProps, Achievement, PlayerStats } from '../types';

interface AchievementsScreenProps extends BaseScreenProps {
  achievements: Record<string, Achievement>;
  playerStats: PlayerStats;
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ onNavigate, achievements, playerStats }) => {
  const [activeTab, setActiveTab] = React.useState<'achievements' | 'stats'>('achievements');
  
  const winPercentage = playerStats.gamesPlayed > 0
    ? Math.round((playerStats.gamesWon / playerStats.gamesPlayed) * 100)
    : 0;

  return (
    <div id="achievements-screen" className="screen active">
      <button className="back-button" onClick={() => onNavigate('main-screen')}>← Volver</button>
      
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          🏆 Logros
        </button>
        <button 
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Estadísticas
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'achievements' && (
        <div className="tab-content">
          <div className="stats-grid" id="achievements-grid">
            {Object.entries(achievements).map(([key, achievement]) => (
              <div key={key} className={`stat-card ${achievement.unlocked ? 'unlocked' : 'locked'}`} style={{ opacity: achievement.unlocked ? 1 : 0.5 }}>
                <div className="stat-title">{achievement.icon} {achievement.name}</div>
                <div className="stat-description">{achievement.description}</div>
                <div className="stat-value">{achievement.unlocked ? '✅ Desbloqueado' : '🔒 Bloqueado'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="tab-content">
          <div className="stats-grid" id="stats-grid">
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
      )}
    </div>
  );
};

export default AchievementsScreen;
