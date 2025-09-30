import React from 'react';
import { BaseScreenProps, GameSettings } from '../types';
import { testFramework } from '../utils/testFramework';

interface SettingsScreenProps extends BaseScreenProps {
  gameSettings: GameSettings;
  setGameSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate, gameSettings, setGameSettings }) => {
  const [simModal, setSimModal] = React.useState<{ visible: boolean; report: string }>({ visible: false, report: '' });
  const [runningSim, setRunningSim] = React.useState(false);

  const runSimulations = async (count: number) => {
    try {
      setRunningSim(true);
      const result = await testFramework.simulateFullGames(count);
      const report = `Simulaciones: ${count}\nEstado: ${result.passed ? '✅ OK' : '❌ Con incidencias'}\n${result.details}\n\nÚltimos registros:\n${result.logs.slice(-5).map(l => `- ${l}`).join('\n')}`;
      setSimModal({ visible: true, report });
    } catch (e) {
      setSimModal({ visible: true, report: `Error al simular: ${String(e)}` });
    } finally {
      setRunningSim(false);
    }
  };
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

          <div className="setting-card">
            <div className="setting-title">🧪 Pruebas y Simulaciones</div>
            <div className="setting-control" style={{ gap: '0.5rem' }}>
              <button className="menu-button" onClick={() => onNavigate('test-screen')} title="Ir a la suite completa de pruebas">
                🧪 Test Suite
              </button>
              <button className="menu-button" disabled={runningSim} onClick={() => runSimulations(10)} title="Simula 10 partidas y muestra resumen">
                {runningSim ? '⏳ Simulando…' : '🧪 Simular 10'}
              </button>
              <button className="menu-button" disabled={runningSim} onClick={() => runSimulations(20)} title="Simula 20 partidas y muestra resumen">
                {runningSim ? '⏳ Simulando…' : '🧪 Simular 20'}
              </button>
            </div>
          </div>
        </div>

        {simModal.visible && (
          <div className="modal active">
            <div className="modal-content">
              <h2 className="modal-title">Resultados de Simulación</h2>
              <pre style={{ maxHeight: '50vh', overflow: 'auto', whiteSpace: 'pre-wrap' }}>{simModal.report}</pre>
              <div className="modal-buttons">
                <button className="modal-button" onClick={() => setSimModal({ visible: false, report: '' })}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsScreen;