import { AICharacter } from '../types';

export type AICharacterRaw = {
  agresividad: number;
  riesgo: number;
  blufeo: number;
  consistencia: number;
  personaje?: string;
  description: string;
  avatar: string;
  activo: boolean;
};

export type AICharactersMap = Record<string, AICharacterRaw>;

export function derivePersonality(c: AICharacterRaw): 'balanced' | 'aggressive' | 'conservative' | 'unpredictable' {
  const { agresividad, blufeo, consistencia, riesgo } = c;
  if (agresividad >= 8 && blufeo >= 7) return 'aggressive';
  if (blufeo >= 8 && riesgo >= 7) return 'unpredictable';
  if (consistencia >= 8 && agresividad <= 4) return 'conservative';
  return 'balanced';
}

export function deriveDifficulty(c: AICharacterRaw): 'easy' | 'medium' | 'intermediate' | 'hard' | 'master' {
  const avg = (c.agresividad + c.riesgo + c.blufeo + c.consistencia) / 4;
  if (avg <= 3.5) return 'easy';
  if (avg <= 5.0) return 'medium';
  if (avg <= 6.5) return 'intermediate';
  if (avg <= 8.0) return 'hard';
  return 'master';
}

export function toAICharacter(name: string, c: AICharacterRaw): AICharacter {
  const slug = name.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[^\w-]/g, '');
  return {
    id: slug,
    name,
    agresividad: c.agresividad,
    riesgo: c.riesgo,
    blufeo: c.blufeo,
    consistencia: c.consistencia,
    description: c.description,
    avatar: c.avatar,
    activo: c.activo,
    difficulty: deriveDifficulty(c),
    personality: derivePersonality(c)
  };
}

export async function loadAICharacters(): Promise<AICharactersMap> {
  const response = await fetch('/config/ai_characters.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Failed to load AI characters: HTTP ${response.status}`);
  const data = await response.json();
  if (typeof data !== 'object' || Array.isArray(data)) throw new Error('Formato de AI inválido');
  return data as AICharactersMap;
}
