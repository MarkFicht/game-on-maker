// Hook for audio service state
import { useState, useEffect } from 'react';
import { audioService } from '@/services/audio';

export function useAudioMuted(): boolean {
  const [muted, setMuted] = useState(audioService.isMuted());

  useEffect(() => {
    const unsubscribe = audioService.subscribe(setMuted);
    return unsubscribe;
  }, []);

  return muted;
}
