import React from 'react';
import { BaseScreenProps, Achievement } from '../types';

interface AchievementsScreenProps extends BaseScreenProps {
  achievements: Record<string, Achievement>;
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ onNavigate, achievements }) => {
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
      </div>
    </div>
  );
};

export default AchievementsScreen;