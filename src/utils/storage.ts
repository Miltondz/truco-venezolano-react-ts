import { GameSettings, PlayerStats, Achievement } from '../types';

const SETTINGS_KEY = 'trucoSettings';
const STATS_KEY = 'trucoStats';
const ACHIEVEMENTS_KEY = 'trucoAchievements';

export function saveSettings(settings: GameSettings): void {
  if (settings.autoSave) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}

export function loadSettings(): GameSettings | null {
  const saved = localStorage.getItem(SETTINGS_KEY);
  return saved ? JSON.parse(saved) : null;
}

export function saveStats(stats: PlayerStats): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function loadStats(): PlayerStats | null {
  const saved = localStorage.getItem(STATS_KEY);
  return saved ? JSON.parse(saved) : null;
}

export function saveAchievements(achievements: Record<string, Achievement>): void {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
}

export function loadAchievements(): Record<string, Achievement> | null {
  const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
  return saved ? JSON.parse(saved) : null;
}

export function exportData(): string {
  const data = {
    version: '1.0',
    timestamp: Date.now(),
    stats: loadStats(),
    achievements: loadAchievements(),
    settings: loadSettings()
  };

  return JSON.stringify(data, null, 2);
}

export function importData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);

    if (data.stats) saveStats(data.stats);
    if (data.achievements) saveAchievements(data.achievements);
    if (data.settings) saveSettings(data.settings);

    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

export function clearAllData(): void {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(STATS_KEY);
  localStorage.removeItem(ACHIEVEMENTS_KEY);
}