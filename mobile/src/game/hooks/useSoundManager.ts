import { useEffect, useRef } from 'react';
import { createAudioPlayer, preload, AudioPlayer } from 'expo-audio';

type SoundKey = 'correct' | 'skip' | 'countdown' | 'gameover' | 'click';

const SOURCES: Record<SoundKey, number> = {
  correct:   require('../../../assets/sounds/correct.wav'),
  skip:      require('../../../assets/sounds/skip.wav'),
  countdown: require('../../../assets/sounds/countdown.wav'),
  gameover:  require('../../../assets/sounds/gameover.wav'),
  click:     require('../../../assets/sounds/click.wav'),
};

// Module scope, before any player is created — without this, the first
// play() of a freshly-created player can be silent or delayed (cold-start
// buffering), even after awaiting seekTo(). See expo-audio docs: preload().
// Wrapped defensively — expo-audio's web shim doesn't reliably return a real
// Promise here, so calling .catch() on its result directly can throw.
for (const source of Object.values(SOURCES)) {
  try {
    Promise.resolve(preload(source)).catch(() => {});
  } catch {}
}

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
      Object.values(players.current).forEach(p => { try { p?.pause(); p?.remove(); } catch {} });
      players.current = {};
    };
  }, []);

  const play = (key: SoundKey) => {
    if (!enabledRef.current) return;
    const player = players.current[key];
    if (!player) return;
    try {
      // seekTo() is async — play() must wait for it or the very first call on
      // a freshly-created player can race the seek and produce no sound at all.
      Promise.resolve(player.seekTo(0)).then(() => player.play()).catch(() => {});
    } catch {}
  };

  const stopAll = () => {
    Object.values(players.current).forEach(p => { try { p?.pause(); } catch {} });
  };

  return {
    playCorrect:   () => play('correct'),
    playSkip:      () => play('skip'),
    playCountdown: () => play('countdown'),
    playGameOver:  () => play('gameover'),
    playClick:     () => play('click'),
    stopAll,
  };
}
