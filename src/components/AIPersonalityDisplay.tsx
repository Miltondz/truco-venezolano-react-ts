import React from 'react';
import { AIPersonality } from '../types';
import { getPersonalityDescription, getPersonalityStrengths, getPersonalityWeaknesses } from '../utils/personality';

interface AIPersonalityDisplayProps {
  personality: AIPersonality;
  isVisible: boolean;
  onClose: () => void;
}

const AIPersonalityDisplay: React.FC<AIPersonalityDisplayProps> = ({
  personality,
  isVisible,
  onClose
}) => {
  if (!isVisible) return null;

  const { agresividad, intimidacion, calculo, adaptabilidad, archetype, description } = personality;
  const strengths = getPersonalityStrengths(personality);
  const weaknesses = getPersonalityWeaknesses(personality);
  const detailedDescription = getPersonalityDescription(personality);

  const getTraitColor = (value: number): string => {
    if (value >= 8) return '#4CAF50'; // Green for high
    if (value >= 6) return '#FFC107'; // Yellow for medium-high
    if (value >= 4) return '#FF9800'; // Orange for medium
    if (value >= 2) return '#FF5722'; // Red for low
    return '#F44336'; // Dark red for very low
  };

  const getTraitLabel = (value: number): string => {
    if (value >= 8) return 'Excelente';
    if (value >= 6) return 'Bueno';
    if (value >= 4) return 'Regular';
    if (value >= 2) return 'Bajo';
    return 'Muy Bajo';
  };

  return (
    <div className="ai-personality-modal" onClick={onClose}>
      <div className="ai-personality-content" onClick={(e) => e.stopPropagation()}>
        <div className="personality-header">
          <h2>🤖 Personalidad de la IA</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="personality-archetype">
          <h3>{archetype}</h3>
          <p className="archetype-description">{description}</p>
        </div>

        <div className="traits-grid">
          <div className="trait-item">
            <div className="trait-label">
              <span>⚔️ Agresividad</span>
              <span className="trait-value" style={{ color: getTraitColor(agresividad) }}>
                {agresividad}/10
              </span>
            </div>
            <div className="trait-bar">
              <div
                className="trait-fill"
                style={{
                  width: `${agresividad * 10}%`,
                  backgroundColor: getTraitColor(agresividad)
                }}
              />
            </div>
            <div className="trait-description">
              {getTraitLabel(agresividad)} - {agresividad >= 7 ? 'Apuesta frecuentemente' :
               agresividad >= 4 ? 'Apuesta moderadamente' : 'Apuesta conservadoramente'}
            </div>
          </div>

          <div className="trait-item">
            <div className="trait-label">
              <span>🧠 Cálculo</span>
              <span className="trait-value" style={{ color: getTraitColor(calculo) }}>
                {calculo}/10
              </span>
            </div>
            <div className="trait-bar">
              <div
                className="trait-fill"
                style={{
                  width: `${calculo * 10}%`,
                  backgroundColor: getTraitColor(calculo)
                }}
              />
            </div>
            <div className="trait-description">
              {getTraitLabel(calculo)} - {calculo >= 7 ? 'Análisis matemático avanzado' :
               calculo >= 4 ? 'Cálculo básico' : 'Juega por instinto'}
            </div>
          </div>

          <div className="trait-item">
            <div className="trait-label">
              <span>🎭 Intimidación</span>
              <span className="trait-value" style={{ color: getTraitColor(intimidacion) }}>
                {intimidacion}/10
              </span>
            </div>
            <div className="trait-bar">
              <div
                className="trait-fill"
                style={{
                  width: `${intimidacion * 10}%`,
                  backgroundColor: getTraitColor(intimidacion)
                }}
              />
            </div>
            <div className="trait-description">
              {getTraitLabel(intimidacion)} - {intimidacion >= 7 ? 'Maestro del bluff' :
               intimidacion >= 4 ? 'Usa faroles ocasionalmente' : 'Juega honestamente'}
            </div>
          </div>

          <div className="trait-item">
            <div className="trait-label">
              <span>🔄 Adaptabilidad</span>
              <span className="trait-value" style={{ color: getTraitColor(adaptabilidad) }}>
                {adaptabilidad}/10
              </span>
            </div>
            <div className="trait-bar">
              <div
                className="trait-fill"
                style={{
                  width: `${adaptabilidad * 10}%`,
                  backgroundColor: getTraitColor(adaptabilidad)
                }}
              />
            </div>
            <div className="trait-description">
              {getTraitLabel(adaptabilidad)} - {adaptabilidad >= 7 ? 'Se adapta rápidamente' :
               adaptabilidad >= 4 ? 'Ajusta estrategia gradualmente' : 'Mantiene estilo fijo'}
            </div>
          </div>
        </div>

        <div className="personality-analysis">
          <div className="analysis-section">
            <h4>🎯 Fortalezas</h4>
            <ul>
              {strengths.map((strength, index) => (
                <li key={index}>• {strength}</li>
              ))}
            </ul>
          </div>

          <div className="analysis-section">
            <h4>⚠️ Debilidades</h4>
            <ul>
              {weaknesses.map((weakness, index) => (
                <li key={index}>• {weakness}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="personality-summary">
          <h4>📊 Análisis General</h4>
          <p>{detailedDescription}</p>
        </div>

        <div className="personality-footer">
          <button className="primary-button" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPersonalityDisplay;