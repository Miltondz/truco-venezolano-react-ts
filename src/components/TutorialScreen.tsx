import React from 'react';
import { BaseScreenProps } from '../types';

const TutorialScreen: React.FC<BaseScreenProps> = ({ onNavigate }) => {
  return (
    <div id="tutorial-screen" className="screen active">
      <button className="back-button" onClick={() => onNavigate('main-screen')}>← Volver</button>
      <div className="screen-content">
        <h2 className="game-title">Tutorial Interactivo</h2>
        <div className="instruction-section">
          <h3 className="instruction-title">🎯 Bienvenido al Tutorial</h3>
          <p className="instruction-text">Aprende a jugar Truco paso a paso con nuestro tutorial interactivo.</p>
          <button id="start-tutorial-btn" className="menu-button" onClick={() => alert('Tutorial no implementado aún')}>
            ▶️ Comenzar Tutorial
          </button>
        </div>
        <div className="instruction-section">
          <h3 className="instruction-title">📚 Lecciones Disponibles</h3>
          <div className="menu-buttons">
            <button className="menu-button" onClick={() => alert('Lección no implementada')}>🃏 Cartas Básicas</button>
            <button className="menu-button" onClick={() => alert('Lección no implementada')}>🎵 Envido</button>
            <button className="menu-button" onClick={() => alert('Lección no implementada')}>⚡ Truco</button>
            <button className="menu-button" onClick={() => alert('Lección no implementada')}>🌸 Flor</button>
            <button className="menu-button" onClick={() => alert('Lección no implementada')}>🧠 Estrategia</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialScreen;