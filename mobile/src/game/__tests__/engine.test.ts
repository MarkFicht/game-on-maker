import { GameEngine, getGameEngine, resetGameEngine } from '../engine';
import type { Deck } from '../types';

function makeDeck(wordCount = 5): Deck {
  return {
    id: 'test',
    name: 'Test',
    description: '',
    icon: '🧪',
    color: '#4F46E5',
    isPremium: false,
    words: Array.from({ length: wordCount }, (_, i) => ({ id: `w${i}`, text: `Słowo ${i}` })),
  };
}

describe('GameEngine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    jest.useFakeTimers();
    engine = new GameEngine();
  });

  afterEach(() => {
    engine.destroy();
    jest.useRealTimers();
  });

  // ── Stan początkowy ──────────────────────────────────────────────────────────

  describe('stan początkowy', () => {
    it('status jest idle', () => {
      expect(engine.getState().status).toBe('idle');
    });

    it('nie ma bieżącego słowa', () => {
      expect(engine.getCurrentWord()).toBeNull();
    });

    it('statystyki są zerowe', () => {
      const { correctCount, skippedCount, totalWords, accuracy } = engine.getStats();
      expect(correctCount).toBe(0);
      expect(skippedCount).toBe(0);
      expect(totalWords).toBe(0);
      expect(accuracy).toBe(0);
    });

    it('timeRemaining równe roundDuration', () => {
      const e = new GameEngine({ roundDuration: 45 });
      expect(e.getState().timeRemaining).toBe(45);
      e.destroy();
    });
  });

  // ── startGame ────────────────────────────────────────────────────────────────

  describe('startGame', () => {
    it('zmienia status na playing', () => {
      engine.startGame(makeDeck());
      expect(engine.getState().status).toBe('playing');
    });

    it('ładuje słowa z talii', () => {
      engine.startGame(makeDeck(8));
      expect(engine.getState().shuffledWords).toHaveLength(8);
    });

    it('zwraca pierwsze słowo', () => {
      engine.startGame(makeDeck());
      expect(engine.getCurrentWord()).not.toBeNull();
    });

    it('ustawia timeRemaining na roundDuration', () => {
      const e = new GameEngine({ roundDuration: 90 });
      e.startGame(makeDeck());
      expect(e.getState().timeRemaining).toBe(90);
      e.destroy();
    });

    it('zeruje wyniki poprzedniej rundy', () => {
      engine.startGame(makeDeck());
      engine.markCorrect();
      engine.startGame(makeDeck());
      expect(engine.getState().results).toHaveLength(0);
    });

    it('inkrementuje roundNumber', () => {
      engine.startGame(makeDeck());
      engine.startGame(makeDeck());
      expect(engine.getState().roundNumber).toBe(2);
    });

    it('emituje GAME_STARTED', () => {
      const handler = jest.fn();
      engine.subscribe(handler);
      engine.startGame(makeDeck());
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ type: 'GAME_STARTED' }));
    });

    it('emituje WORD_CHANGED z index 0', () => {
      const handler = jest.fn();
      engine.subscribe(handler);
      engine.startGame(makeDeck());
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ type: 'WORD_CHANGED', index: 0 }));
    });

    it('przycina listę do wordsPerRound gdy > 0', () => {
      const e = new GameEngine({ wordsPerRound: 3 });
      e.startGame(makeDeck(10));
      expect(e.getState().shuffledWords).toHaveLength(3);
      e.destroy();
    });
  });

  // ── Timer ────────────────────────────────────────────────────────────────────

  describe('timer', () => {
    it('zmniejsza timeRemaining co sekundę', () => {
      engine.startGame(makeDeck(20));
      const start = engine.getState().timeRemaining;
      jest.advanceTimersByTime(3000);
      expect(engine.getState().timeRemaining).toBe(start - 3);
    });

    it('kończy grę gdy czas minie', () => {
      const e = new GameEngine({ roundDuration: 2 });
      e.startGame(makeDeck(20));
      jest.advanceTimersByTime(2500);
      expect(e.getState().status).toBe('finished');
      e.destroy();
    });

    it('emituje TIME_UPDATED na każdy tick', () => {
      const handler = jest.fn();
      engine.subscribe(handler);
      engine.startGame(makeDeck(20));
      handler.mockClear();
      jest.advanceTimersByTime(3000);
      const timeEvents = handler.mock.calls.filter(c => c[0].type === 'TIME_UPDATED');
      expect(timeEvents).toHaveLength(3);
    });

    it('emituje GAME_FINISHED gdy czas minie', () => {
      const e = new GameEngine({ roundDuration: 1 });
      const handler = jest.fn();
      e.subscribe(handler);
      e.startGame(makeDeck(20));
      jest.advanceTimersByTime(1500);
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ type: 'GAME_FINISHED' }));
      e.destroy();
    });
  });

  // ── markCorrect ──────────────────────────────────────────────────────────────

  describe('markCorrect', () => {
    it('przechodzi do następnego słowa', () => {
      engine.startGame(makeDeck());
      const first = engine.getCurrentWord()!.id;
      engine.markCorrect();
      expect(engine.getCurrentWord()!.id).not.toBe(first);
    });

    it('zapisuje wynik jako poprawny', () => {
      engine.startGame(makeDeck());
      engine.markCorrect();
      expect(engine.getState().results[0].wasCorrect).toBe(true);
    });

    it('zwiększa correctCount w statystykach', () => {
      engine.startGame(makeDeck());
      engine.markCorrect();
      engine.markCorrect();
      expect(engine.getStats().correctCount).toBe(2);
    });

    it('kończy grę po ostatnim słowie', () => {
      engine.startGame(makeDeck(2));
      engine.markCorrect();
      engine.markCorrect();
      expect(engine.getState().status).toBe('finished');
    });

    it('nic nie robi gdy nie gra', () => {
      engine.markCorrect();
      expect(engine.getState().results).toHaveLength(0);
    });
  });

  // ── markSkipped ──────────────────────────────────────────────────────────────

  describe('markSkipped', () => {
    it('zapisuje wynik jako pominięty', () => {
      engine.startGame(makeDeck());
      engine.markSkipped();
      expect(engine.getState().results[0].wasCorrect).toBe(false);
    });

    it('zwiększa skippedCount w statystykach', () => {
      engine.startGame(makeDeck());
      engine.markSkipped();
      engine.markSkipped();
      expect(engine.getStats().skippedCount).toBe(2);
    });

    it('nic nie robi gdy allowSkip jest false', () => {
      const e = new GameEngine({ allowSkip: false });
      e.startGame(makeDeck());
      e.markSkipped();
      expect(e.getState().results).toHaveLength(0);
      e.destroy();
    });

    it('nic nie robi gdy nie gra', () => {
      engine.markSkipped();
      expect(engine.getState().results).toHaveLength(0);
    });
  });

  // ── pauseGame / resumeGame ───────────────────────────────────────────────────

  describe('pauseGame / resumeGame', () => {
    it('zmienia status na paused', () => {
      engine.startGame(makeDeck());
      engine.pauseGame();
      expect(engine.getState().status).toBe('paused');
    });

    it('zatrzymuje timer podczas pauzy', () => {
      const e = new GameEngine({ roundDuration: 30 });
      e.startGame(makeDeck(20));
      e.pauseGame();
      jest.advanceTimersByTime(5000);
      expect(e.getState().timeRemaining).toBe(30);
      e.destroy();
    });

    it('wznawia status playing', () => {
      engine.startGame(makeDeck());
      engine.pauseGame();
      engine.resumeGame();
      expect(engine.getState().status).toBe('playing');
    });

    it('timer działa po wznowieniu', () => {
      const e = new GameEngine({ roundDuration: 30 });
      e.startGame(makeDeck(20));
      e.pauseGame();
      e.resumeGame();
      jest.advanceTimersByTime(2000);
      expect(e.getState().timeRemaining).toBe(28);
      e.destroy();
    });

    it('pauseGame nic nie robi gdy idle', () => {
      engine.pauseGame();
      expect(engine.getState().status).toBe('idle');
    });

    it('resumeGame nic nie robi gdy playing', () => {
      engine.startGame(makeDeck());
      engine.resumeGame();
      expect(engine.getState().status).toBe('playing');
    });

    it('emituje GAME_PAUSED', () => {
      const handler = jest.fn();
      engine.subscribe(handler);
      engine.startGame(makeDeck());
      engine.pauseGame();
      expect(handler).toHaveBeenCalledWith({ type: 'GAME_PAUSED' });
    });

    it('emituje GAME_RESUMED', () => {
      const handler = jest.fn();
      engine.subscribe(handler);
      engine.startGame(makeDeck());
      engine.pauseGame();
      engine.resumeGame();
      expect(handler).toHaveBeenCalledWith({ type: 'GAME_RESUMED' });
    });
  });

  // ── endGame ──────────────────────────────────────────────────────────────────

  describe('endGame', () => {
    it('kończy grę ze stanu playing', () => {
      engine.startGame(makeDeck());
      engine.endGame();
      expect(engine.getState().status).toBe('finished');
    });

    it('kończy grę ze stanu paused', () => {
      engine.startGame(makeDeck());
      engine.pauseGame();
      engine.endGame();
      expect(engine.getState().status).toBe('finished');
    });

    it('nic nie robi gdy idle', () => {
      engine.endGame();
      expect(engine.getState().status).toBe('idle');
    });
  });

  // ── reset ────────────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('wraca do idle', () => {
      engine.startGame(makeDeck());
      engine.reset();
      expect(engine.getState().status).toBe('idle');
    });

    it('czyści wyniki', () => {
      engine.startGame(makeDeck());
      engine.markCorrect();
      engine.reset();
      expect(engine.getState().results).toHaveLength(0);
    });

    it('zatrzymuje timer', () => {
      const e = new GameEngine({ roundDuration: 30 });
      e.startGame(makeDeck(20));
      e.reset();
      jest.advanceTimersByTime(5000);
      expect(e.getState().timeRemaining).toBe(30);
      e.destroy();
    });

    it('emituje GAME_RESET', () => {
      const handler = jest.fn();
      engine.subscribe(handler);
      engine.startGame(makeDeck());
      engine.reset();
      expect(handler).toHaveBeenCalledWith({ type: 'GAME_RESET' });
    });
  });

  // ── getStats ─────────────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('liczy accuracy 50% (2 dobre, 2 pominięte)', () => {
      engine.startGame(makeDeck(5));
      engine.markCorrect();
      engine.markCorrect();
      engine.markSkipped();
      engine.markSkipped();
      expect(engine.getStats().accuracy).toBe(50);
    });

    it('accuracy = 100 gdy wszystkie poprawne', () => {
      engine.startGame(makeDeck(3));
      engine.markCorrect();
      engine.markCorrect();
      engine.markCorrect();
      expect(engine.getStats().accuracy).toBe(100);
    });

    it('accuracy = 0 przed odpowiedziami', () => {
      engine.startGame(makeDeck());
      expect(engine.getStats().accuracy).toBe(0);
    });

    it('totalWords = suma wszystkich odpowiedzi', () => {
      engine.startGame(makeDeck(4));
      engine.markCorrect();
      engine.markSkipped();
      expect(engine.getStats().totalWords).toBe(2);
    });
  });

  // ── updateConfig ─────────────────────────────────────────────────────────────

  describe('updateConfig', () => {
    it('zmienia roundDuration dla następnej gry', () => {
      engine.updateConfig({ roundDuration: 90 });
      engine.startGame(makeDeck());
      expect(engine.getState().timeRemaining).toBe(90);
    });

    it('aktualizuje timeRemaining gdy idle', () => {
      engine.updateConfig({ roundDuration: 90 });
      expect(engine.getState().timeRemaining).toBe(90);
    });

    it('nie zmienia timeRemaining gdy playing', () => {
      engine = new GameEngine({ roundDuration: 60 });
      engine.startGame(makeDeck(20));
      jest.advanceTimersByTime(5000);
      engine.updateConfig({ roundDuration: 120 });
      expect(engine.getState().timeRemaining).toBe(55);
    });
  });

  // ── subscribe / unsubscribe ──────────────────────────────────────────────────

  describe('subscribe / unsubscribe', () => {
    it('dostarczy zdarzenia subskrybentowi', () => {
      const handler = jest.fn();
      engine.subscribe(handler);
      engine.startGame(makeDeck());
      expect(handler).toHaveBeenCalled();
    });

    it('po unsubscribe nie dostarcza zdarzeń', () => {
      const handler = jest.fn();
      const unsub = engine.subscribe(handler);
      unsub();
      engine.startGame(makeDeck());
      expect(handler).not.toHaveBeenCalled();
    });

    it('getState zwraca kopię (nie referencję)', () => {
      engine.startGame(makeDeck());
      const s1 = engine.getState();
      const s2 = engine.getState();
      expect(s1).not.toBe(s2);
    });
  });
});

// ── Singleton ────────────────────────────────────────────────────────────────

describe('getGameEngine (singleton)', () => {
  afterEach(() => resetGameEngine());

  it('zwraca tę samą instancję przy kolejnych wywołaniach', () => {
    const a = getGameEngine();
    const b = getGameEngine();
    expect(a).toBe(b);
  });

  it('po resetGameEngine zwraca nową instancję', () => {
    const a = getGameEngine();
    resetGameEngine();
    const b = getGameEngine();
    expect(a).not.toBe(b);
  });

  it('updateConfig przez getGameEngine modyfikuje ten sam silnik', () => {
    const a = getGameEngine();
    getGameEngine({ roundDuration: 99 });
    expect(a.getConfig().roundDuration).toBe(99);
  });
});
