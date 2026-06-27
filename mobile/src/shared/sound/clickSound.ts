import { createAudioPlayer, preload, AudioPlayer } from 'expo-audio';

const SOURCE = require('../../../assets/sounds/click.wav');

// Module scope — without this, creating the player lazily on the very first
// tap is a cold-start native call that can block the JS thread for ~1s,
// delaying that tap's onPress (e.g. navigation) right behind it.
try {
  Promise.resolve(preload(SOURCE)).catch(() => {});
} catch {}

let player: AudioPlayer | null = null;

function getPlayer(): AudioPlayer {
  if (!player) player = createAudioPlayer(SOURCE);
  return player;
}

export function playClickSound() {
  try {
    const p = getPlayer();
    Promise.resolve(p.seekTo(0)).then(() => p.play()).catch(() => {});
  } catch {}
}
