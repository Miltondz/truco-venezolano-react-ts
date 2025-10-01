import React, { useState } from 'react';

interface LorePanelProps {
  events: string[];
  manoIsPlayer?: boolean;
}

const LorePanel: React.FC<LorePanelProps> = ({ events, manoIsPlayer }) => {
  // Check if mobile viewport
  const isMobile = window.innerWidth <= 768;
  const [collapsed, setCollapsed] = useState(isMobile);

  return (
    <div className={`lore-panel ${collapsed ? 'collapsed' : ''}`} aria-live="polite">
      <div className="lore-header">
        <span>📜 Jugadas y Lore</span>
        <button
          className="lore-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Mostrar panel' : 'Ocultar panel'}
          title={collapsed ? 'Mostrar' : 'Ocultar'}
        >
          {collapsed ? '⬇' : '⬆'}
        </button>
      </div>
      {!collapsed && (
        <div className="lore-body">
          <div className="lore-meta">
            Mano: {manoIsPlayer ? 'Jugador' : 'Computadora'}
          </div>
        {events && events.length > 0 ? (
            <ul className="lore-list">
              {[...events].slice(-50).reverse().map((e, i) => (
                <li key={i} className="lore-item">{e}</li>
              ))}
            </ul>
          ) : (
            <div className="lore-placeholder">Aquí verás explicaciones de cantos y jugadas durante la partida.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default LorePanel;
