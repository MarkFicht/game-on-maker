// Game Play Page
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { TimerRing, WordCard, GameActions, ResultsView } from '@/components/game';
import { useGame } from '@/hooks/useGame';
import { getDeckById } from '@/game/decks';
import { updateLifetimeStats } from '@/services/storage';
import { track } from '@/services/analytics';

export default function Game() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdown, setCountdown] = useState(3);
  
  const {
    state,
    currentWord,
    stats,
    startGame,
    pauseGame,
    resumeGame,
    markCorrect,
    markSkipped,
  } = useGame();
  
  const deck = deckId ? getDeckById(deckId) : null;
  
  // Countdown before game starts
  useEffect(() => {
    if (!deck || !showCountdown) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowCountdown(false);
          startGame(deck);
          track('game_started', { deckId: deck.id, deckName: deck.name });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [deck, showCountdown, startGame]);
  
  // Save stats when game finishes
  useEffect(() => {
    if (state.status === 'finished') {
      updateLifetimeStats({
        wordsGuessed: stats.correctCount,
        playTime: state.totalTime - state.timeRemaining,
      });
      track('game_finished', { 
        deckId: deck?.id, 
        correct: stats.correctCount,
        skipped: stats.skippedCount,
      });
    }
  }, [state.status, stats, deck, state.totalTime, state.timeRemaining]);
  
  // Handle missing deck
  if (!deck) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Deck not found</p>
          <button 
            onClick={() => navigate('/decks')}
            className="text-primary underline"
          >
            Back to decks
          </button>
        </div>
      </div>
    );
  }
  
  const handlePlayAgain = () => {
    setShowCountdown(true);
    setCountdown(3);
  };
  
  const handleHome = () => {
    navigate('/');
  };
  
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background safe-top safe-bottom safe-x overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Countdown */}
        {showCountdown && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <span className="text-6xl mb-4">{deck.icon}</span>
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
              {deck.name}
            </h2>
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="font-display text-8xl font-bold text-gradient-primary"
            >
              {countdown}
            </motion.div>
            <p className="text-muted-foreground mt-8">Get ready!</p>
          </motion.div>
        )}
        
        {/* Playing */}
        {!showCountdown && state.status === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col p-4"
          >
            {/* Timer */}
            <div className="flex justify-center pt-4 pb-8">
              <TimerRing
                timeRemaining={state.timeRemaining}
                totalTime={state.totalTime}
                size={140}
                strokeWidth={10}
              />
            </div>
            
            {/* Score indicator */}
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-success">{stats.correctCount}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-warning">{stats.skippedCount}</p>
                <p className="text-xs text-muted-foreground">Skipped</p>
              </div>
            </div>
            
            {/* Word card */}
            <div className="flex-1 flex items-center justify-center px-4">
              <WordCard word={currentWord} deckIcon={deck.icon} />
            </div>
            
            {/* Actions */}
            <div className="py-6">
              <GameActions
                onCorrect={markCorrect}
                onSkip={markSkipped}
                onPause={pauseGame}
                onResume={resumeGame}
                isPaused={false}
              />
            </div>
          </motion.div>
        )}
        
        {/* Paused */}
        {!showCountdown && state.status === 'paused' && (
          <motion.div
            key="paused"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-4"
          >
            <div className="game-card p-8 text-center">
              <span className="text-5xl mb-4 block">⏸️</span>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Game Paused
              </h2>
              <p className="text-muted-foreground mb-6">
                {state.timeRemaining}s remaining
              </p>
              <GameActions
                onCorrect={markCorrect}
                onSkip={markSkipped}
                onPause={pauseGame}
                onResume={resumeGame}
                isPaused={true}
              />
            </div>
          </motion.div>
        )}
        
        {/* Results */}
        {!showCountdown && state.status === 'finished' && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-4"
          >
            <ResultsView
              stats={stats}
              results={state.results}
              onPlayAgain={handlePlayAgain}
              onHome={handleHome}
              deckName={deck.name}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
