// React hook for game engine integration
import { useState, useEffect, useCallback, useRef } from 'react';
import { GameEngine, getGameEngine } from '@/game/engine';
import type { GameState, GameConfig, GameStats, Deck, Word, GameEvent } from '@/game/types';

export interface UseGameReturn {
  state: GameState;
  currentWord: Word | null;
  stats: GameStats;
  startGame: (deck: Deck) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  markCorrect: () => void;
  markSkipped: () => void;
  endGame: () => void;
  reset: () => void;
  updateConfig: (config: Partial<GameConfig>) => void;
}

export function useGame(initialConfig?: Partial<GameConfig>): UseGameReturn {
  const engineRef = useRef<GameEngine | null>(null);
  
  // Get or create engine
  if (!engineRef.current) {
    engineRef.current = getGameEngine(initialConfig);
  }
  
  const engine = engineRef.current;
  
  const [state, setState] = useState<GameState>(engine.getState());
  const [currentWord, setCurrentWord] = useState<Word | null>(engine.getCurrentWord());
  const [stats, setStats] = useState<GameStats>(engine.getStats());
  
  // Subscribe to engine events
  useEffect(() => {
    const handleEvent = (event: GameEvent) => {
      setState(engine.getState());
      setCurrentWord(engine.getCurrentWord());
      setStats(engine.getStats());
      
      // Additional handling based on event type
      switch (event.type) {
        case 'GAME_FINISHED':
          console.log('[useGame] Game finished with stats:', event.stats);
          break;
        case 'WORD_CHANGED':
          console.log('[useGame] Word changed:', event.word.text);
          break;
      }
    };
    
    const unsubscribe = engine.subscribe(handleEvent);
    
    return () => {
      unsubscribe();
    };
  }, [engine]);
  
  const startGame = useCallback((deck: Deck) => {
    engine.startGame(deck);
  }, [engine]);
  
  const pauseGame = useCallback(() => {
    engine.pauseGame();
  }, [engine]);
  
  const resumeGame = useCallback(() => {
    engine.resumeGame();
  }, [engine]);
  
  const markCorrect = useCallback(() => {
    engine.markCorrect();
  }, [engine]);
  
  const markSkipped = useCallback(() => {
    engine.markSkipped();
  }, [engine]);
  
  const reset = useCallback(() => {
    engine.reset();
  }, [engine]);
  
  const endGame = useCallback(() => {
    engine.endGame();
  }, [engine]);
  
  const updateConfig = useCallback((config: Partial<GameConfig>) => {
    engine.updateConfig(config);
    setState(engine.getState());
  }, [engine]);
  
  return {
    state,
    currentWord,
    stats,
    startGame,
    pauseGame,
    resumeGame,
    markCorrect,
    markSkipped,
    endGame,
    reset,
    updateConfig,
  };
}
