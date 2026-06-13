import { useEffect, useRef } from 'react';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';

type SoundKey = 'correct' | 'skip' | 'countdown' | 'gameover' | 'click';

const SOURCES: Record<SoundKey, number> = {
  correct:   require('../../../assets/sounds/correct.wav'),
  skip:      require('../../../assets/sounds/skip.wav'),
  countdown: require('../../../assets/sounds/countdown.wav'),
  gameover:  require('../../../assets/sounds/gameover.wav'),
  click:     require('../../../assets/sounds/click.wav'),
};

export function useSoundManager(soundEnabled: boolean) {
  const players = useRef<Partial<Record<SoundKey, AudioPlayer>>>({});
  const enabledRef = useRef(soundEnabled);
  enabledRef.current = soundEnabled;

  useEffect(() => {
    for (const [key, source] of Object.entries(SOURCES) as [SoundKey, number][]) {
      try {
        players.current[key] = createAudioPlayer(source);
      } catch { }
    }
    return () => {
      Object.values(players.current).forEach(p => { try { p?.remove(); } catch {} });
      players.current = {};
    };
  }, []);

  const play = (key: SoundKey) => {
    if (!enabledRef.current) return;
    const player = players.current[key];
    if (!player) return;
    try {
      player.seekTo(0);
      player.play();
    } catch { }
  };

  return {
    playCorrect:   () => play('correct'),
    playSkip:      () => play('skip'),
    playCountdown: () => play('countdown'),
    playGameOver:  () => play('gameover'),
    playClick:     () => play('click'),
  };
}
