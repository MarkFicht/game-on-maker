// Audio Service - Sound effects with mute capability
// Portable to React Native (expo-av) with minimal changes

export type SoundType = 
  | 'tap' 
  | 'correct' 
  | 'skip' 
  | 'countdown' 
  | 'gameStart' 
  | 'gameEnd' 
  | 'timeWarning'
  | 'pause'
  | 'resume'
  | 'unlock';

// Web Audio Context for generating sounds
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Sound configurations
const soundConfigs: Record<SoundType, { frequency: number; duration: number; type: OscillatorType; volume: number; attack?: number; decay?: number }> = {
  tap: { frequency: 600, duration: 0.05, type: 'sine', volume: 0.3 },
  correct: { frequency: 880, duration: 0.15, type: 'sine', volume: 0.4, attack: 0.01, decay: 0.1 },
  skip: { frequency: 300, duration: 0.1, type: 'triangle', volume: 0.3 },
  countdown: { frequency: 440, duration: 0.2, type: 'sine', volume: 0.4 },
  gameStart: { frequency: 660, duration: 0.3, type: 'sine', volume: 0.5 },
  gameEnd: { frequency: 220, duration: 0.5, type: 'triangle', volume: 0.4 },
  timeWarning: { frequency: 520, duration: 0.15, type: 'square', volume: 0.3 },
  pause: { frequency: 400, duration: 0.1, type: 'sine', volume: 0.3 },
  resume: { frequency: 500, duration: 0.1, type: 'sine', volume: 0.3 },
  unlock: { frequency: 880, duration: 0.4, type: 'sine', volume: 0.4, attack: 0.05, decay: 0.3 },
};

class AudioService {
  private muted: boolean = false;
  private listeners: Set<(muted: boolean) => void> = new Set();

  constructor() {
    // Load mute state from localStorage
    const savedMute = localStorage.getItem('wordgame_sound_muted');
    this.muted = savedMute === 'true';
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    localStorage.setItem('wordgame_sound_muted', String(muted));
    this.listeners.forEach(listener => listener(muted));
  }

  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  subscribe(listener: (muted: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  play(sound: SoundType): void {
    if (this.muted) return;

    try {
      const ctx = getAudioContext();
      const config = soundConfigs[sound];
      
      // Resume context if suspended (required for mobile)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = config.type;
      oscillator.frequency.value = config.frequency;

      const now = ctx.currentTime;
      const attack = config.attack || 0.01;
      const decay = config.decay || config.duration * 0.5;

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(config.volume, now + attack);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + config.duration);

      // Special effects for some sounds
      if (sound === 'correct') {
        // Rising pitch for correct answer
        oscillator.frequency.linearRampToValueAtTime(config.frequency * 1.5, now + config.duration);
      } else if (sound === 'gameEnd') {
        // Descending pitch for game end
        oscillator.frequency.linearRampToValueAtTime(config.frequency * 0.5, now + config.duration);
      } else if (sound === 'unlock') {
        // Celebratory arpeggio effect
        oscillator.frequency.setValueAtTime(660, now);
        oscillator.frequency.setValueAtTime(880, now + 0.1);
        oscillator.frequency.setValueAtTime(1100, now + 0.2);
      }

      oscillator.start(now);
      oscillator.stop(now + config.duration);
    } catch (error) {
      console.warn('[Audio] Failed to play sound:', sound, error);
    }
  }

  // Play a sequence of countdown beeps
  playCountdown(count: number): void {
    if (this.muted) return;
    
    if (count === 0) {
      this.play('gameStart');
    } else {
      this.play('countdown');
    }
  }

  // Play time warning beep (for last 10 seconds)
  playTimeWarning(): void {
    this.play('timeWarning');
  }
}

// Singleton export
export const audioService = new AudioService();

// React hook for audio service
export function useAudio() {
  return {
    play: (sound: SoundType) => audioService.play(sound),
    playCountdown: (count: number) => audioService.playCountdown(count),
    playTimeWarning: () => audioService.playTimeWarning(),
    isMuted: () => audioService.isMuted(),
    setMuted: (muted: boolean) => audioService.setMuted(muted),
    toggleMute: () => audioService.toggleMute(),
    subscribe: (listener: (muted: boolean) => void) => audioService.subscribe(listener),
  };
}
