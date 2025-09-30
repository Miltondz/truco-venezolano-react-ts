// AI Characters Data for Venezuelan Truco
import { AICharacter } from '../types';

export const AI_CHARACTERS: Record<string, AICharacter> = {
  'Don Ramiro': {
    id: 'don-ramiro',
    name: 'Don Ramiro',
    agresividad: 4,
    riesgo: 3,
    blufeo: 5,
    consistencia: 9,
    description: 'Dueño de sus tierras y de la mesa. Juega con la paciencia del que sabe esperar la cosecha. No arriesga de más, pero no perdona un error.',
    avatar: 'avatar1-default.jpg',
    activo: true,
    difficulty: 'intermediate',
    personality: 'conservative'
  },
  'El Doctor Soto': {
    id: 'el-doctor-soto',
    name: 'El Doctor Soto',
    agresividad: 6,
    riesgo: 6,
    blufeo: 8,
    consistencia: 8,
    description: 'Cada carta es un argumento y cada canto, una objeción. Te llevará a juicio en cada mano. Cuidado con sus faroles, son su especialidad.',
    avatar: 'avatar2-default.jpg',
    activo: true,
    difficulty: 'intermediate',
    personality: 'balanced'
  },
  'El Programador': {
    id: 'el-programador',
    name: 'El Programador',
    agresividad: 6,
    riesgo: 7,
    blufeo: 4,
    consistencia: 6,
    description: 'Calcula las probabilidades en tiempo real y juega con la lógica de un algoritmo. No es muy expresivo, pero su mente no deja de compilar la mejor jugada.',
    avatar: 'avatar3-default.jpg',
    activo: true,
    difficulty: 'hard',
    personality: 'balanced'
  },
  'Valentina': {
    id: 'valentina',
    name: 'Valentina',
    agresividad: 8,
    riesgo: 8,
    blufeo: 7,
    consistencia: 6,
    description: 'Con la alegría del caribe y la mente de una académica. Te sonreirá mientras te canta "quiero vale cuatro". Su juego es tan vibrante como su vestido.',
    avatar: 'avatar4-default.jpg',
    activo: true,
    difficulty: 'hard',
    personality: 'aggressive'
  },
  'Carlos, el pana': {
    id: 'carlos-el-pana',
    name: 'Carlos, el pana',
    agresividad: 2,
    riesgo: 3,
    blufeo: 2,
    consistencia: 9,
    description: 'Juega como cuida a su familia: con honestidad y sin riesgos innecesarios. Su amabilidad esconde un juego sólido y consistente.',
    avatar: 'avatar5-default.jpg',
    activo: true,
    difficulty: 'easy',
    personality: 'conservative'
  },
  'El Salsero': {
    id: 'el-salsero',
    name: 'El Salsero',
    agresividad: 8,
    riesgo: 7,
    blufeo: 9,
    consistencia: 4,
    description: 'Lleva el ritmo de la salsa a la mesa. Sus jugadas son como un paso de baile: vistosas, inesperadas y siempre con clave.',
    avatar: 'avatar6-default.jpg',
    activo: true,
    difficulty: 'hard',
    personality: 'unpredictable'
  },
  'La Universitaria': {
    id: 'la-universitaria',
    name: 'La Universitaria',
    agresividad: 3,
    riesgo: 5,
    blufeo: 5,
    consistencia: 8,
    description: 'Recién graduada de la teoría del Truco, ahora busca la práctica. Juega siguiendo el manual al pie de la letra y a veces sorprende con lo que acaba de aprender.',
    avatar: 'avatar7-default.jpg',
    activo: true,
    difficulty: 'medium',
    personality: 'balanced'
  },
  'El Chamo': {
    id: 'el-chamo',
    name: 'El Chamo',
    agresividad: 5,
    riesgo: 5,
    blufeo: 4,
    consistencia: 8,
    description: 'Joven relajado que juega con calma. Ideal para principiantes. No se apura, pero tampoco se queda atrás.',
    avatar: 'avatar-el-chamo-default.jpg',
    activo: false,
    difficulty: 'easy',
    personality: 'balanced'
  },
  'La Tía Lulú': {
    id: 'la-tia-lulu',
    name: 'La Tía Lulú',
    agresividad: 2,
    riesgo: 3,
    blufeo: 1,
    consistencia: 9,
    description: 'Señora cautelosa que solo juega si está segura. Perfecta para aprender a no arriesgar innecesariamente.',
    avatar: 'avatar-la-tia-lulu-default.jpg',
    activo: false,
    difficulty: 'easy',
    personality: 'conservative'
  },
  'El Borracho de la Esquina': {
    id: 'el-borracho-de-la-esquina',
    name: 'El Borracho de la Esquina',
    agresividad: 6,
    riesgo: 7,
    blufeo: 8,
    consistencia: 3,
    description: 'Impredecible y divertido. A veces gana con suerte, otras tira todo. ¡Nunca sabrás qué hará!',
    avatar: 'avatar-el-borracho-de-la-esquina-default.jpg',
    activo: false,
    difficulty: 'medium',
    personality: 'unpredictable'
  },
  'El Profesor': {
    id: 'el-profesor',
    name: 'El Profesor',
    agresividad: 6,
    riesgo: 6,
    blufeo: 5,
    consistencia: 7,
    description: 'Analiza cada jugada. No es agresivo, pero sabe cuándo subir la apuesta. Ideal para jugadores intermedios.',
    avatar: 'avatar-el-profesor-default.jpg',
    activo: false,
    difficulty: 'medium',
    personality: 'balanced'
  },
  'El Gato': {
    id: 'el-gato',
    name: 'El Gato',
    agresividad: 9,
    riesgo: 8,
    blufeo: 7,
    consistencia: 6,
    description: 'Agresivo y desafiante. Siempre quiere subir la apuesta. ¡Te retará a cada truco y retruco!',
    avatar: 'avatar-el-gato-default.jpg',
    activo: false,
    difficulty: 'hard',
    personality: 'aggressive'
  },
  'La Abuela': {
    id: 'la-abuela',
    name: 'La Abuela',
    agresividad: 3,
    riesgo: 2,
    blufeo: 1,
    consistencia: 10,
    description: 'Muy conservadora. Solo juega si tiene cartas fuertes. Te enseñará a jugar seguro y estratégico.',
    avatar: 'avatar-la-abuela-default.jpg',
    activo: false,
    difficulty: 'easy',
    personality: 'conservative'
  },
  'El Maestro': {
    id: 'el-maestro',
    name: 'El Maestro',
    agresividad: 7,
    riesgo: 7,
    blufeo: 6,
    consistencia: 9,
    description: 'Jugador perfecto. Sabe leer a sus rivales y juega sin errores. Para expertos que quieren ser desafiados.',
    avatar: 'avatar-el-maestro-default.jpg',
    activo: false,
    difficulty: 'master',
    personality: 'balanced'
  },
  'El Gambetero': {
    id: 'el-gambetero',
    name: 'El Gambetero',
    agresividad: 10,
    riesgo: 9,
    blufeo: 8,
    consistencia: 5,
    description: 'Profesional del juego. Busca el "vale cuatro" siempre. Si no ganas, te lleva hasta la casa.',
    avatar: 'avatar-el-gambetero-default.jpg',
    activo: false,
    difficulty: 'master',
    personality: 'aggressive'
  },
  'La Bruja': {
    id: 'la-bruja',
    name: 'La Bruja',
    agresividad: 1,
    riesgo: 1,
    blufeo: 2,
    consistencia: 10,
    description: 'Misteriosa y calculadora. Solo juega cuando "la brujería lo permite". Nunca comete errores.',
    avatar: 'avatar-la-bruja-default.jpg',
    activo: false,
    difficulty: 'master',
    personality: 'conservative'
  },
  'El Locochón': {
    id: 'el-locochon',
    name: 'El Locochón',
    agresividad: 8,
    riesgo: 9,
    blufeo: 10,
    consistencia: 2,
    description: 'Caótico y divertido. Juega como si estuviera loco. ¡Nunca sabrás si está blufeando o no!',
    avatar: 'avatar-el-locochon-default.jpg',
    activo: false,
    difficulty: 'hard',
    personality: 'unpredictable'
  },
  'El Estratega': {
    id: 'el-estratega',
    name: 'El Estratega',
    agresividad: 8,
    riesgo: 8,
    blufeo: 7,
    consistencia: 10,
    description: 'Planificador militar. No comete errores. Cada jugada está calculada. ¡Desafío extremo!',
    avatar: 'avatar-el-estratega-default.jpg',
    activo: false,
    difficulty: 'master',
    personality: 'balanced'
  },
  'El Fantasma': {
    id: 'el-fantasma',
    name: 'El Fantasma',
    agresividad: 7,
    riesgo: 6,
    blufeo: 9,
    consistencia: 1,
    description: 'Figura etérea que aparece y desaparece. Juega como si fuera un espectro. Impredecible al máximo.',
    avatar: 'avatar-el-fantasma-default.jpg',
    activo: false,
    difficulty: 'hard',
    personality: 'unpredictable'
  }
};

// Helper function to get active characters
export const getActiveAICharacters = (): AICharacter[] => {
  return Object.values(AI_CHARACTERS).filter(character => character.activo);
};

// Helper function to get character by ID
export const getAICharacterById = (id: string): AICharacter | undefined => {
  return Object.values(AI_CHARACTERS).find(character => character.id === id);
};

// Helper function to get character by name (legacy support)
export const getAICharacterByName = (name: string): AICharacter | undefined => {
  return AI_CHARACTERS[name];
};

// Get difficulty level name in Spanish
export const getDifficultyLabel = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return 'Fácil';
    case 'medium': return 'Medio';
    case 'intermediate': return 'Intermedio';
    case 'hard': return 'Difícil';
    case 'master': return 'Maestro';
    default: return 'Desconocido';
  }
};

// Get personality name in Spanish
export const getPersonalityLabel = (personality: string): string => {
  switch (personality) {
    case 'aggressive': return 'Agresivo';
    case 'conservative': return 'Conservador';
    case 'balanced': return 'Equilibrado';
    case 'unpredictable': return 'Impredecible';
    default: return 'Desconocido';
  }
};