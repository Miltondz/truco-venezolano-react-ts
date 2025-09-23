import React from 'react';
import { BaseScreenProps } from '../types';

const InstructionsScreen: React.FC<BaseScreenProps> = ({ onNavigate }) => {
  return (
    <div id="instructions-screen" className="screen active">
      <button className="back-button" onClick={() => onNavigate('main-screen')}>← Volver</button>
      <div className="screen-content">
        <h2 className="game-title">Instrucciones</h2>
        <div className="instructions-content">
          <div className="instruction-section">
            <h3 className="instruction-title">🎯 Objetivo del Juego</h3>
            <p className="instruction-text">El Truco es un juego de cartas venezolano donde el objetivo es ser el primero en alcanzar 30 puntos. Se juega con una baraja española de 40 cartas.</p>
          </div>
          <div className="instruction-section">
            <h3 className="instruction-title">🃏 Jerarquía de Cartas</h3>
            <p className="instruction-text">De mayor a menor valor:</p>
            <div className="card-hierarchy">
              <div className="hierarchy-card">As de Espadas (14)</div>
              <div className="hierarchy-card">As de Bastos (13)</div>
              <div className="hierarchy-card">7 de Espadas (12)</div>
              <div className="hierarchy-card">7 de Oros (11)</div>
              <div className="hierarchy-card">3 (10)</div>
              <div className="hierarchy-card">2 (9)</div>
              <div className="hierarchy-card">As resto (8)</div>
              <div className="hierarchy-card">Rey (7)</div>
              <div className="hierarchy-card">Caballo (6)</div>
              <div className="hierarchy-card">Sota (5)</div>
              <div className="hierarchy-card">7 resto (4)</div>
              <div className="hierarchy-card">6 (3)</div>
              <div className="hierarchy-card">5 (2)</div>
              <div className="hierarchy-card">4 (1)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsScreen;