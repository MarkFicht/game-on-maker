// Game Play Page
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, XCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SoundToggle } from '@/components/SoundToggle';
import { TimerRing, WordCard, GameActions, ResultsView } from '@/components/game';
import { useGame } from '@/hooks/useGame';
import { useSettings } from '@/hooks/useSettings';
import { getDeckById } from '@/game/decks';
import { updateLifetimeStats } from '@/services/storage';
import { audioService } from '@/services/audio';
import { track } from '@/services/analytics';

export default function Game() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [gamePhase, setGamePhase] = useState<'ready' | 'countdown' | 'playing'>('ready');
  const [countdown, setCountdown] = useState(3);
  const lastWarningTimeRef = useRef<number>(-1);
  const { settings } = useSettings();
  
  const {
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
  } = useGame({ roundDuration: settings.roundDuration });
  
  const deck = deckId ? getDeckById(deckId) : null;
  
  // Update game config when settings change
  useEffect(() => {
    updateConfig({ roundDuration: settings.roundDuration });
  }, [settings.roundDuration, updateConfig]);
  
  // Countdown before game starts
  useEffect(() => {
    if (!deck || gamePhase !== 'countdown') return;
    
    // Play initial countdown sound
    audioService.playCountdown(countdown);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGamePhase('playing');
          startGame(deck);
          audioService.playCountdown(0); // Game start sound
          track('game_started', { deckId: deck.id, deckName: deck.name });
          return 0;
        }
        audioService.playCountdown(prev - 1);
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [deck, gamePhase, startGame]);
  
  // Play time warning sounds in last 10 seconds - only once per second
  useEffect(() => {
    if (state.status === 'playing' && state.timeRemaining <= 10 && state.timeRemaining > 0) {
      // Only play if we haven't played for this time value yet
      if (lastWarningTimeRef.current !== state.timeRemaining) {
        lastWarningTimeRef.current = state.timeRemaining;
        audioService.playTimeWarning();
      }
    }
    
    // Reset ref when game is not playing
    if (state.status !== 'playing') {
      lastWarningTimeRef.current = -1;
    }
  }, [state.timeRemaining, state.status]);
  
  // Save stats when game finishes
  useEffect(() => {
    if (state.status === 'finished') {
      audioService.play('gameEnd');
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
  
  const handleStartCountdown = () => {
    audioService.play('tap');
    setGamePhase('countdown');
    setCountdown(3);
  };
  
  const handleCancelGame = () => {
    audioService.play('tap');
    reset();
    navigate('/decks');
  };
  
  const handlePlayAgain = () => {
    audioService.play('tap');
    setGamePhase('ready');
    setCountdown(3);
  };
  
  const handleHome = () => {
    audioService.play('tap');
    navigate('/');
  };
  
  const handleCorrect = () => {
    audioService.play('correct');
    markCorrect();
  };
  
  const handleSkip = () => {
    audioService.play('skip');
    markSkipped();
  };
  
  const handlePause = () => {
    audioService.play('pause');
    pauseGame();
  };
  
  const handleResume = () => {
    audioService.play('resume');
    resumeGame();
  };
  
  const handleEndGame = () => {
    audioService.play('tap');
    reset();
    navigate('/decks');
  };
  
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background safe-top safe-bottom safe-x overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Ready state - before countdown */}
        {gamePhase === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-border/50">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleCancelGame}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="font-display text-lg font-bold text-foreground">
                {deck.name}
              </h1>
              <SoundToggle />
            </header>
            
            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' }}
                className="text-center"
              >
                <span className="text-8xl mb-4 block">{deck.icon}</span>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  {deck.name}
                </h2>
                <p className="text-muted-foreground">
                  {deck.words.length} words • {deck.difficulty}
                </p>
              </motion.div>
              
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    onClick={handleStartCountdown}
                    className="w-full h-16 text-xl font-bold btn-game rounded-2xl glow text-primary-foreground"
                  >
                    <Play className="w-6 h-6 mr-3" fill="currentColor" />
                    Start Game
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleCancelGame}
                    className="w-full h-14 text-lg rounded-2xl"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Choose Different Deck
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Countdown */}
        {gamePhase === 'countdown' && (
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
        {gamePhase === 'playing' && state.status === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Header - consistent across all views */}
            <header className="flex items-center justify-end p-4 shrink-0">
              <SoundToggle size="sm" />
            </header>
            
            <div className="flex-1 flex flex-col px-3 pb-3 md:px-4 md:pb-4 overflow-y-auto">
              {/* Timer - always centered, size changes based on screen */}
              <div className="flex justify-center pb-2 pt-2">
                <div className="md:hidden">
                  <TimerRing
                    timeRemaining={state.timeRemaining}
                    totalTime={state.totalTime}
                    size={70}
                    strokeWidth={6}
                  />
                </div>
                <div className="hidden md:block">
                  <TimerRing
                    timeRemaining={state.timeRemaining}
                    totalTime={state.totalTime}
                    size={110}
                    strokeWidth={8}
                  />
                </div>
              </div>
              
              {/* Score indicator */}
              <div className="flex justify-center gap-6 md:gap-8 mb-3 md:mb-4">
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-success">{stats.correctCount}</p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-warning">{stats.skippedCount}</p>
                  <p className="text-xs text-muted-foreground">Skipped</p>
                </div>
              </div>
              
              {/* Word card and actions centered together */}
              <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-5 px-2 md:px-4 min-h-0">
                <WordCard word={currentWord} deckIcon={deck.icon} />
                <GameActions
                  onCorrect={handleCorrect}
                  onSkip={handleSkip}
                  onPause={handlePause}
                  onResume={handleResume}
                  isPaused={false}
                />
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Paused */}
        {gamePhase === 'playing' && state.status === 'paused' && (
          <motion.div
            key="paused"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-4"
          >
            <div className="game-card p-8 text-center max-w-sm w-full">
              <span className="text-5xl mb-4 block">⏸️</span>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Game Paused
              </h2>
              <p className="text-muted-foreground mb-6">
                {state.timeRemaining}s remaining
              </p>
              
              <div className="flex flex-col gap-3">
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    onClick={handleResume}
                    className="w-full h-14 text-lg font-semibold btn-game rounded-2xl text-primary-foreground"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Resume
                  </Button>
                </motion.div>
                
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleEndGame}
                    className="w-full h-14 text-lg rounded-2xl text-destructive border-destructive/50 hover:bg-destructive/10"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    End Game
                  </Button>
                </motion.div>
                
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleHome}
                    className="w-full h-12 text-muted-foreground"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Back to Home
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Results */}
        {gamePhase === 'playing' && state.status === 'finished' && (
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
