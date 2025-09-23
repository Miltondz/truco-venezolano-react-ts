import React from 'react';
import { BaseScreenProps, GameSettings } from '../types';

interface SettingsScreenProps extends BaseScreenProps {
  gameSettings: GameSettings;
  setGameSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate, gameSettings, setGameSettings }) => {
  const toggleSetting = (setting: keyof typeof gameSettings) => {
    setGameSettings({
      ...gameSettings,
      [setting]: !gameSettings[setting]
    });
  };

  return (
    <div id="settings-screen" className="screen active">
      <button className="back-button" onClick={() => onNavigate('main-screen')}>← Volver</button>
      <div className="screen-content">
        <h2 className="game-title">Configuración</h2>
        <div className="settings-grid">
          <div className="setting-card">
            <div className="setting-title">🎮 Juego</div>
            <div className="setting-control">
              <span className="setting-label">Animaciones</span>
              <div className={`toggle-switch ${gameSettings.animationsEnabled ? 'active' : ''}`} onClick={() => toggleSetting('animationsEnabled')}></div>
            </div>
            <div className="setting-control">
              <span className="setting-label">Confirmación de Jugadas</span>
              <div className={`toggle-switch ${gameSettings.confirmMoves ? 'active' : ''}`} onClick={() => toggleSetting('confirmMoves')}></div>
            </div>
            <div className="setting-control">
              <span className="setting-label">Mostrar Consejos</span>
              <div className={`toggle-switch ${gameSettings.showHints ? 'active' : ''}`} onClick={() => toggleSetting('showHints')}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;