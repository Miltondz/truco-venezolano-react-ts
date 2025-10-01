import { AIPersonality } from '../types';

// Predefined personality archetypes
export const PERSONALITY_ARCHETYPES: Record<string, AIPersonality> = {
  'Calculador Defensivo': {
    agresividad: 2,
    intimidacion: 3,
    calculo: 9,
    adaptabilidad: 7,
    archetype: 'Calculador Defensivo',
    description: 'Estratega analítico que prefiere jugadas seguras y calculadas'
  },
  'Psicólogo Agresivo': {
    agresividad: 7,
    intimidacion: 8,
    calculo: 5,
    adaptabilidad: 6,
    archetype: 'Psicólogo Agresivo',
    description: 'Jugador intimidante que usa faroles y presión psicológica'
  },
  'Estratega Adaptable': {
    agresividad: 5,
    intimidacion: 4,
    calculo: 7,
    adaptabilidad: 9,
    archetype: 'Estratega Adaptable',
    description: 'Maestro de la adaptación que ajusta su estilo según la situación'
  },
  'Intimidante Calculador': {
    agresividad: 6,
    intimidacion: 7,
    calculo: 8,
    adaptabilidad: 5,
    archetype: 'Intimidante Calculador',
    description: 'Analista intimidante que combina cálculo con presión psicológica'
  }
};

export function generateRandomPersonality(): AIPersonality {
  // Generate random traits with some correlation
  const baseAgresividad = Math.floor(Math.random() * 11); // 0-10
  const baseCalculo = Math.floor(Math.random() * 11);
  const baseIntimidacion = Math.floor(Math.random() * 11);
  const baseAdaptabilidad = Math.floor(Math.random() * 11);

  // Add some correlation between traits
  const agresividad = Math.max(1, Math.min(10, baseAgresividad + (Math.random() > 0.5 ? 1 : -1)));
  const calculo = Math.max(1, Math.min(10, baseCalculo + (Math.random() > 0.5 ? 1 : -1)));
  const intimidacion = Math.max(1, Math.min(10, baseIntimidacion + (Math.random() > 0.5 ? 1 : -1)));
  const adaptabilidad = Math.max(1, Math.min(10, baseAdaptabilidad + (Math.random() > 0.5 ? 1 : -1)));

  return {
    agresividad,
    intimidacion,
    calculo,
    adaptabilidad,
    archetype: 'Personalizado',
    description: `Personalidad única con traits: Agresividad ${agresividad}, Cálculo ${calculo}, Intimidación ${intimidacion}, Adaptabilidad ${adaptabilidad}`
  };
}

export function generatePersonalityFromArchetype(archetypeName: string): AIPersonality {
  const archetype = PERSONALITY_ARCHETYPES[archetypeName];
  if (archetype) {
    // Add small random variations to make each game unique
    const variation = () => Math.max(1, Math.min(10, Math.floor(Math.random() * 3) - 1));

    return {
      agresividad: Math.max(1, Math.min(10, archetype.agresividad + variation())),
      intimidacion: Math.max(1, Math.min(10, archetype.intimidacion + variation())),
      calculo: Math.max(1, Math.min(10, archetype.calculo + variation())),
      adaptabilidad: Math.max(1, Math.min(10, archetype.adaptabilidad + variation())),
      archetype: archetype.archetype,
      description: archetype.description
    };
  }

  // Fallback to random if archetype not found
  return generateRandomPersonality();
}

export function getRandomArchetypeName(): string {
  const archetypeNames = Object.keys(PERSONALITY_ARCHETYPES);
  return archetypeNames[Math.floor(Math.random() * archetypeNames.length)];
}

export function getPersonalityDescription(personality: AIPersonality): string {
  const { agresividad, intimidacion, calculo, adaptabilidad } = personality;

  let description = '';

  if (calculo >= 8) {
    description += 'Altamente analítico y calculador. ';
  } else if (calculo <= 3) {
    description += 'Instintivo y reactivo. ';
  }

  if (agresividad >= 8) {
    description += 'Muy agresivo en sus apuestas. ';
  } else if (agresividad <= 3) {
    description += 'Conservador y cauteloso. ';
  }

  if (intimidacion >= 8) {
    description += 'Maestro del bluff y la intimidación. ';
  } else if (intimidacion <= 3) {
    description += 'Honesto y directo en su juego. ';
  }

  if (adaptabilidad >= 8) {
    description += 'Se adapta rápidamente a diferentes situaciones. ';
  } else if (adaptabilidad <= 3) {
    description += 'Mantiene un estilo de juego consistente. ';
  }

  return description || 'Jugador con estilo equilibrado.';
}

export function getPersonalityStrengths(personality: AIPersonality): string[] {
  const strengths: string[] = [];
  const { agresividad, intimidacion, calculo, adaptabilidad } = personality;

  if (calculo >= 7) strengths.push('Análisis matemático');
  if (agresividad >= 7) strengths.push('Apuestas agresivas');
  if (intimidacion >= 7) strengths.push('Faroles psicológicos');
  if (adaptabilidad >= 7) strengths.push('Adaptación estratégica');

  return strengths.length > 0 ? strengths : ['Juego equilibrado'];
}

export function getPersonalityWeaknesses(personality: AIPersonality): string[] {
  const weaknesses: string[] = [];
  const { agresividad, intimidacion, calculo, adaptabilidad } = personality;

  if (calculo <= 4) weaknesses.push('Falta de análisis');
  if (agresividad <= 4) weaknesses.push('Timidez en apuestas');
  if (intimidacion <= 4) weaknesses.push('Dificultad para bluffear');
  if (adaptabilidad <= 4) weaknesses.push('Rigidez estratégica');

  return weaknesses.length > 0 ? weaknesses : ['Sin debilidades evidentes'];
}

/**
 * Convierte los atributos del AICharacter a AIPersonality
 * Usa los atributos del oponente (agresividad, riesgo, blufeo, consistencia)
 * para crear una personalidad coherente
 */
export function convertOpponentToPersonality(opponent: any): AIPersonality {
  if (!opponent) {
    return generateRandomPersonality();
  }

  // Mapear atributos del oponente a personalidad de IA
  // agresividad -> agresividad (directo)
  // blufeo -> intimidacion (capacidad de farolear)
  // riesgo -> calculo inverso (a mayor riesgo, menor cálculo)
  // consistencia -> adaptabilidad (habilidad de mantener estrategia)
  
  const agresividad = opponent.agresividad || 5;
  const intimidacion = opponent.blufeo || 5;
  const calculo = Math.max(1, Math.min(10, 11 - (opponent.riesgo || 5))); // Inverso del riesgo
  const adaptabilidad = opponent.consistencia || 5;

  const personalityLabel = getPersonalityLabelFromTraits(agresividad, intimidacion, calculo, adaptabilidad);

  return {
    agresividad,
    intimidacion,
    calculo,
    adaptabilidad,
    archetype: opponent.name || 'Oponente',
    description: `${opponent.name}: ${personalityLabel}`
  };
}

/**
 * Determina la etiqueta de personalidad según los rasgos
 */
function getPersonalityLabelFromTraits(agresividad: number, intimidacion: number, calculo: number, adaptabilidad: number): string {
  if (agresividad >= 8 && intimidacion >= 7) {
    return 'Psicólogo Agresivo';
  } else if (calculo >= 8 && agresividad <= 4) {
    return 'Calculador Defensivo';
  } else if (adaptabilidad >= 8 && calculo >= 7) {
    return 'Estratega Adaptable';
  } else if (intimidacion >= 7 && calculo >= 7) {
    return 'Intimidante Calculador';
  } else if (agresividad >= 7) {
    return 'Jugador Agresivo';
  } else if (calculo >= 7) {
    return 'Jugador Calculador';
  } else if (intimidacion >= 7) {
    return 'Farolero Experto';
  } else if (adaptabilidad >= 7) {
    return 'Jugador Adaptable';
  } else {
    return 'Jugador Equilibrado';
  }
}
