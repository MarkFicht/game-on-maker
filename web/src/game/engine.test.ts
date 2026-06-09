// Game Engine Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngine } from '@/game/engine';
import { sampleDecks } from '@/game/decks';

describe('GameEngine', () => {
  let engine: GameEngine;
  
  beforeEach(() => {
    vi.useFakeTimers();
    engine = new GameEngine({ roundDuration: 10 });
  });
  
  afterEach(() => {
    engine.destroy();
    vi.useRealTimers();
  });
  
  describe('initialization', () => {
    it('should initialize with idle status', () => {
      const state = engine.getState();
      expect(state.status).toBe('idle');
      expect(state.currentDeck).toBeNull();
      expect(state.results).toHaveLength(0);
    });
    
    it('should use provided config', () => {
      const config = engine.getConfig();
      expect(config.roundDuration).toBe(10);
    });
  });
  
  describe('game flow', () => {
    it('should start game with deck', () => {
      const deck = sampleDecks[0];
      engine.startGame(deck);
      
      const state = engine.getState();
      expect(state.status).toBe('playing');
      expect(state.currentDeck).toEqual(deck);
      expect(state.shuffledWords.length).toBeGreaterThan(0);
    });
    
    it('should get current word', () => {
      engine.startGame(sampleDecks[0]);
      const word = engine.getCurrentWord();
      
      expect(word).not.toBeNull();
      expect(word?.text).toBeTruthy();
    });
    
    it('should track correct answers', () => {
      engine.startGame(sampleDecks[0]);
      engine.markCorrect();
      
      const stats = engine.getStats();
      expect(stats.correctCount).toBe(1);
      expect(stats.totalWords).toBe(1);
    });
    
    it('should track skipped answers', () => {
      engine.startGame(sampleDecks[0]);
      engine.markSkipped();
      
      const stats = engine.getStats();
      expect(stats.skippedCount).toBe(1);
      expect(stats.correctCount).toBe(0);
    });
    
    it('should emit events on answer', () => {
      const handler = vi.fn();
      engine.subscribe(handler);
      engine.startGame(sampleDecks[0]);
      
      // Clear initial events
      handler.mockClear();
      
      engine.markCorrect();
      
      expect(handler).toHaveBeenCalled();
      const events = handler.mock.calls.map(call => call[0].type);
      expect(events).toContain('WORD_ANSWERED');
      expect(events).toContain('WORD_CHANGED');
    });
  });
  
  describe('timer', () => {
    it('should decrease time remaining', () => {
      engine.startGame(sampleDecks[0]);
      const initialTime = engine.getState().timeRemaining;
      
      vi.advanceTimersByTime(3000);
      
      const newTime = engine.getState().timeRemaining;
      expect(newTime).toBe(initialTime - 3);
    });
    
    it('should finish game when timer runs out', () => {
      engine.startGame(sampleDecks[0]);
      
      vi.advanceTimersByTime(11000);
      
      expect(engine.getState().status).toBe('finished');
    });
  });
  
  describe('pause/resume', () => {
    it('should pause game', () => {
      engine.startGame(sampleDecks[0]);
      engine.pauseGame();
      
      expect(engine.getState().status).toBe('paused');
    });
    
    it('should resume game', () => {
      engine.startGame(sampleDecks[0]);
      engine.pauseGame();
      engine.resumeGame();
      
      expect(engine.getState().status).toBe('playing');
    });
    
    it('should stop timer when paused', () => {
      engine.startGame(sampleDecks[0]);
      const timeAtPause = engine.getState().timeRemaining;
      
      engine.pauseGame();
      vi.advanceTimersByTime(5000);
      
      expect(engine.getState().timeRemaining).toBe(timeAtPause);
    });
  });
  
  describe('stats calculation', () => {
    it('should calculate accuracy', () => {
      engine.startGame(sampleDecks[0]);
      engine.markCorrect();
      engine.markCorrect();
      engine.markSkipped();
      engine.markCorrect();
      
      const stats = engine.getStats();
      expect(stats.correctCount).toBe(3);
      expect(stats.skippedCount).toBe(1);
      expect(stats.accuracy).toBe(75);
    });
  });
});
