import { GameSettings } from '../types';

let audioContext: AudioContext | null = null;
let soundEffects: Record<string, () => void> = {};

export function initializeAudio(): void {
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    soundEffects = {
      navigate: createTone(440, 0.1),
      playCard: createTone(523, 0.2),
      dealCards: createTone(330, 0.3),
      call: createTone(659, 0.2),
      accept: createTone(523, 0.3),
      reject: createTone(294, 0.3),
      roundWin: createTone(659, 0.5),
      roundLose: createTone(220, 0.5),
      roundTie: createTone(440, 0.3),
      gameWin: createTone(880, 1.0),
      gameLose: createTone(165, 1.0),
      gameStart: createTone(523, 0.4),
      envidoWin: createTone(698, 0.4),
      envidoLose: createTone(247, 0.4),
      florWin: createTone(784, 0.6),
      achievement: createTone(1047, 0.8),
      fold: createTone(196, 0.4),
      pause: createTone(370, 0.2),
      resume: createTone(494, 0.2)
    };
  } catch (e) {
    console.warn('Audio no disponible:', e);
  }
}

function createTone(frequency: number, duration: number): () => void {
  return () => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    const volume = 0.1;
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };
}

export function playSound(soundName: string, settings: GameSettings): void {
  if (soundEffects[soundName] && settings.soundEffectsEnabled) {
    soundEffects[soundName]();
  }
}