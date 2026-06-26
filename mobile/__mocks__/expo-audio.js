function createAudioPlayer() {
  return {
    seekTo: jest.fn(() => Promise.resolve()),
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
  };
}

function preload() {
  return Promise.resolve();
}

module.exports = { createAudioPlayer, preload };
