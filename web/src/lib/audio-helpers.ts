// Audio helpers to reduce repetitive audioService.play calls
import { audioService } from '@/services/audio';

/**
 * Wrapper that plays audio and calls the provided function
 */
export function withAudio<T extends any[]>(
  sound: Parameters<typeof audioService.play>[0],
  fn: (...args: T) => void
) {
  return (...args: T) => {
    audioService.play(sound);
    fn(...args);
  };
}

/**
 * Async version of withAudio
 */
export function withAudioAsync<T extends any[]>(
  sound: Parameters<typeof audioService.play>[0],
  fn: (...args: T) => Promise<void>
) {
  return async (...args: T) => {
    audioService.play(sound);
    await fn(...args);
  };
}
