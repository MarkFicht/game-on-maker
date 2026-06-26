function createAudioPlayer() {
  return {
    seekTo: jest.fn(() => Promise.resolve()),
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
  };
}

module.exports = { createAudioPlayer };
