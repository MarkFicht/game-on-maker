// Game Engine - Pure logic, no UI dependencies
// Can be used in React, React Native, Node.js, etc.

import type { 
  GameState, 
  GameConfig, 
  GameStats, 
  Deck, 
  Word, 
  RoundResult,
  GameEvent,
  GameEventHandler 
} from './types';
import { shuffleArray } from './utils';

const DEFAULT_CONFIG: GameConfig = {
  roundDuration: 60,
  wordsPerRound: 0,
  allowSkip: true,
  skipPenalty: false,
};

export class GameEngine {
  private state: GameState;
  private config: GameConfig;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<GameEventHandler> = new Set();
  
  constructor(config: Partial<GameConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = this.createInitialState();
  }
  
  private createInitialState(): GameState {
    return {
      status: 'idle',
      currentDeck: null,
      currentWordIndex: 0,
      shuffledWords: [],
      results: [],
      timeRemaining: this.config.roundDuration,
      totalTime: this.config.roundDuration,
      roundNumber: 0,
    };
  }
  
  // Event handling
  subscribe(handler: GameEventHandler): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }
  
  private emit(event: GameEvent): void {
    this.listeners.forEach(handler => handler(event));
  }
  
  // Getters
  getState(): GameState {
    return { ...this.state };
  }
  
  getConfig(): GameConfig {
    return { ...this.config };
  }
  
  getCurrentWord(): Word | null {
    if (this.state.status !== 'playing' || !this.state.shuffledWords.length) {
      return null;
    }
    return this.state.shuffledWords[this.state.currentWordIndex] || null;
  }
  
  getStats(): GameStats {
    const results = this.state.results;
    const correctCount = results.filter(r => r.wasCorrect).length;
    const skippedCount = results.filter(r => !r.wasCorrect).length;
    const totalWords = results.length;
    const accuracy = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;
    
    const timeUsed = this.state.totalTime - this.state.timeRemaining;
    const averageTimePerWord = totalWords > 0 ? timeUsed / totalWords : 0;
    
    return {
      correctCount,
      skippedCount,
      totalWords,
      accuracy,
      averageTimePerWord,
    };
  }
  
  // Game control
  startGame(deck: Deck): void {
    if (this.state.status === 'playing') {
      this.stopTimer();
    }
    
    let words = shuffleArray(deck.words);
    if (this.config.wordsPerRound > 0) {
      words = words.slice(0, this.config.wordsPerRound);
    }
    
    this.state = {
      status: 'playing',
      currentDeck: deck,
      currentWordIndex: 0,
      shuffledWords: words,
      results: [],
      timeRemaining: this.config.roundDuration,
      totalTime: this.config.roundDuration,
      roundNumber: this.state.roundNumber + 1,
    };
    
    this.startTimer();
    this.emit({ type: 'GAME_STARTED', deck });
    this.emit({ 
      type: 'WORD_CHANGED', 
      word: words[0], 
      index: 0 
    });
  }
  
  pauseGame(): void {
    if (this.state.status !== 'playing') return;
    
    this.stopTimer();
    this.state.status = 'paused';
    this.emit({ type: 'GAME_PAUSED' });
  }
  
  resumeGame(): void {
    if (this.state.status !== 'paused') return;
    
    this.state.status = 'playing';
    this.startTimer();
    this.emit({ type: 'GAME_RESUMED' });
  }
  
  // Answer handling
  markCorrect(): void {
    this.recordAnswer(true);
  }
  
  markSkipped(): void {
    if (!this.config.allowSkip) return;
    this.recordAnswer(false);
  }
  
  private recordAnswer(wasCorrect: boolean): void {
    if (this.state.status !== 'playing') return;
    
    const currentWord = this.getCurrentWord();
    if (!currentWord) return;
    
    const result: RoundResult = {
      word: currentWord,
      wasCorrect,
      timestamp: Date.now(),
    };
    
    this.state.results.push(result);
    this.emit({ type: 'WORD_ANSWERED', result });
    
    this.nextWord();
  }
  
  private nextWord(): void {
    const nextIndex = this.state.currentWordIndex + 1;
    
    if (nextIndex >= this.state.shuffledWords.length) {
      this.finishGame();
      return;
    }
    
    this.state.currentWordIndex = nextIndex;
    const word = this.state.shuffledWords[nextIndex];
    this.emit({ type: 'WORD_CHANGED', word, index: nextIndex });
  }
  
  // Timer
  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.state.timeRemaining <= 0) {
        this.finishGame();
        return;
      }
      
      this.state.timeRemaining--;
      this.emit({ type: 'TIME_UPDATED', timeRemaining: this.state.timeRemaining });
      
      if (this.state.timeRemaining <= 0) {
        this.finishGame();
      }
    }, 1000);
  }
  
  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
  
  private finishGame(): void {
    this.stopTimer();
    this.state.status = 'finished';
    this.emit({ type: 'GAME_FINISHED', stats: this.getStats() });
  }
  
  // Public method to end game early
  endGame(): void {
    if (this.state.status !== 'playing' && this.state.status !== 'paused') return;
    this.finishGame();
  }
  
  // Reset
  reset(): void {
    this.stopTimer();
    this.state = this.createInitialState();
    this.emit({ type: 'GAME_RESET' });
  }
  
  // Cleanup
  destroy(): void {
    this.stopTimer();
    this.listeners.clear();
  }
  
  // Config updates
  updateConfig(config: Partial<GameConfig>): void {
    this.config = { ...this.config, ...config };
    this.state.totalTime = this.config.roundDuration;
    if (this.state.status === 'idle') {
      this.state.timeRemaining = this.config.roundDuration;
    }
  }
}

// Singleton factory for easy React hook usage
let engineInstance: GameEngine | null = null;

export function getGameEngine(config?: Partial<GameConfig>): GameEngine {
  if (!engineInstance) {
    engineInstance = new GameEngine(config);
  } else if (config) {
    engineInstance.updateConfig(config);
  }
  return engineInstance;
}

export function resetGameEngine(): void {
  if (engineInstance) {
    engineInstance.destroy();
    engineInstance = null;
  }
}
