import { createAudioPlayer, AudioPlayer } from 'expo-audio';

let player: AudioPlayer | null = null;

function getPlayer(): AudioPlayer {
  if (!player) player = createAudioPlayer(require('../../../assets/sounds/click.wav'));
  return player;
}

export function playClickSound() {
  try {
    const p = getPlayer();
    p.seekTo(0).then(() => p.play()).catch(() => {});
  } catch {}
}
