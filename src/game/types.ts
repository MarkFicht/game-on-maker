// Game Engine Types
// Core types for the word game logic - completely UI-independent

export interface Word {
  id: string;
  text: string;
  category?: string;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  words: Word[];
  isPremium: boolean;
  icon: string;
  color: string;
}

export interface RoundResult {
  word: Word;
  wasCorrect: boolean;
  timestamp: number;
}

export interface GameState {
  status: 'idle' | 'playing' | 'paused' | 'finished';
  currentDeck: Deck | null;
  currentWordIndex: number;
  shuffledWords: Word[];
  results: RoundResult[];
  timeRemaining: number;
  totalTime: number;
  roundNumber: number;
}

export interface GameConfig {
  roundDuration: number; // seconds
  wordsPerRound: number; // 0 = unlimited (use all words)
  allowSkip: boolean;
  skipPenalty: boolean; // count skipped as incorrect
}

export interface GameStats {
  correctCount: number;
  skippedCount: number;
  totalWords: number;
  accuracy: number;
  averageTimePerWord: number;
}

// Events emitted by game engine
export type GameEvent = 
  | { type: 'GAME_STARTED'; deck: Deck }
  | { type: 'WORD_CHANGED'; word: Word; index: number }
  | { type: 'WORD_ANSWERED'; result: RoundResult }
  | { type: 'TIME_UPDATED'; timeRemaining: number }
  | { type: 'GAME_PAUSED' }
  | { type: 'GAME_RESUMED' }
  | { type: 'GAME_FINISHED'; stats: GameStats }
  | { type: 'GAME_RESET' };

export type GameEventHandler = (event: GameEvent) => void;
