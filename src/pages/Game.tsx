// Game Play Page
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, XCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { PageLayout } from '@/components/PageLayout';
import { SoundToggle } from '@/components/SoundToggle';
import { CenteredState } from '@/components/CenteredState';
import { TimerRing, WordCard, GameActions, ResultsView } from '@/components/game';
import { scaleIn, Tappable, FadeTransition } from '@/components/animated';
import { withAudio } from '@/lib/audio-helpers';
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
    return <CenteredState message="Deck not found" action={{ label: "Back to decks", onClick: () => navigate('/decks') }} />;
  }
  
  const handleStartCountdown = withAudio('tap', () => {
    setGamePhase('countdown');
    setCountdown(3);
  });
  
  const handleCancelGame = withAudio('tap', () => {
    reset();
    navigate('/decks');
  });
  
  const handlePlayAgain = withAudio('tap', () => {
    reset();
    setGamePhase('ready');
    setCountdown(3);
  });
  
  const handleHome = withAudio('tap', () => {
    reset();
    navigate('/');
  });
  
  const handleCorrect = withAudio('correct', markCorrect);
  const handleSkip = withAudio('skip', markSkipped);
  const handlePause = withAudio('pause', pauseGame);
  const handleResume = withAudio('resume', resumeGame);
  const handleEndGame = withAudio('tap', endGame);
  
  return (
    <PageLayout>
      {/* Header - only on ready phase */}
      {gamePhase === 'ready' && (
        <PageHeader 
          title={deck.name} 
          onBack={handleCancelGame}
        />
      )}
      
      <main className="flex-1 p-4 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Ready state - before countdown */}
          {gamePhase === 'ready' && (
            <FadeTransition itemKey="ready" className="flex-1 flex flex-col">
              {/* Content */}
              <div className="flex-1 flex flex-col items-center justify-center gap-8">
                <motion.div
                  {...scaleIn}
                  transition={{ type: 'spring' }}
                  className="text-center"
                >
                  <span className="text-8xl mb-4 block emoji-outlined-lg">{deck.icon}</span>
                  <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                    {deck.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {deck.words.length} words • {deck.difficulty}
                  </p>
                </motion.div>
                
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <Tappable>
                    <Button
                      size="lg"
                      onClick={handleStartCountdown}
                      className="w-full h-16 text-xl font-bold btn-game rounded-2xl border-4 border-white glow text-primary-foreground hover:border-primary"
                    >
                      <Play className="w-6 h-6 mr-1" fill="currentColor" />
                      Start Game
                    </Button>
                  </Tappable>
                  
                  <Tappable>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleCancelGame}
                      className="w-full h-14 text-lg rounded-2xl border-4 border-white hover:border-accent hover:bg-accent/75"
                    >
                      <XCircle className="w-5 h-5 mr-1" />
                      Choose Deck
                    </Button>
                  </Tappable>
                </div>
              </div>
            </FadeTransition>
          )}
          
          {/* Countdown */}
          {gamePhase === 'countdown' && (
            <FadeTransition itemKey="countdown" className="flex-1 flex flex-col items-center justify-center">
              <span className="text-8xl mb-4 emoji-outlined-lg">{deck.icon}</span>
              <h2 className="font-display text-4xl font-bold text-foreground mb-8">
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

              <p className="text-white  mt-8 text-2xl font-semibold bg-card overlay-darker rounded-xl px-6 py-3">Get ready!</p>
            </FadeTransition>
          )}
          
          {/* Playing */}
          {gamePhase === 'playing' && state.status === 'playing' && (
            <FadeTransition itemKey="playing" className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 flex flex-col md:p-4 overflow-y-auto">
                
                {/* Timer - always centered, size changes based on screen */}
                <div className="flex justify-center pb-2">
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
                <div className="flex justify-center mb-3 md:mb-4">
                  <div className="inline-flex gap-6 md:gap-8 overlay-dark rounded-2xl py-3 px-6">
                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-bold text-success">{stats.correctCount}</p>
                      <p className="text-xs text-muted-foreground">Correct</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-bold text-warning">{stats.skippedCount}</p>
                      <p className="text-xs text-muted-foreground">Skipped</p>
                    </div>
                  </div>
                </div>
                
                {/* Word card and actions centered together */}
                <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-5 md:px-2 min-h-0">
                  <WordCard word={currentWord} deckIcon={deck.icon} />
                  <GameActions
                    onCorrect={handleCorrect}
                    onSkip={handleSkip}
                    onPause={handlePause}
                  />
                </div>
              </div>
            </FadeTransition>
          )}
          
          {/* Paused */}
          {gamePhase === 'playing' && state.status === 'paused' && (
            <FadeTransition itemKey="paused" className="flex-1 flex items-center justify-center p-4">
              <div className="game-card p-8 text-center max-w-sm w-full">
                <span className="text-5xl mb-4 block emoji-outlined-md">⏸️</span>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Game Paused
                </h2>
                <p className="text-muted-foreground mb-6">
                  {state.timeRemaining}s remaining
                </p>
                
                <div className="flex flex-col gap-3">
                  <Tappable>
                    <Button
                      size="lg"
                      onClick={handleResume}
                      className="w-full h-14 text-xl font-bold btn-game rounded-xl border-4 border-white glow text-primary-foreground hover:border-primary"
                    >
                      <Play className="w-5 h-5 mr-1" fill='currentColor' />
                      Resume
                    </Button>
                  </Tappable>
                  
                  <Tappable>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleEndGame}
                      className="w-full h-14 text-lg rounded-xl text-destructive border-4 border-destructive/50 hover:bg-destructive/20 hover:text-destructive"
                    >
                      <XCircle className="w-5 h-5 mr-1" />
                      End Game
                    </Button>
                  </Tappable>
                  
                  <Tappable>
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={handleHome}
                      className="w-full h-12 text-lg text-muted-foreground rounded-xl"
                    >
                      <Home className="w-5 h-5 mr-1" />
                      Back to Home
                    </Button>
                  </Tappable>
                </div>
              </div>
            </FadeTransition>
          )}
          
          {/* Results */}
          {gamePhase === 'playing' && state.status === 'finished' && (
            <FadeTransition itemKey="results" className="flex-1 flex flex-col items-center justify-center">
              <ResultsView
                stats={stats}
                results={state.results}
                onPlayAgain={handlePlayAgain}
                onHome={handleHome}
                deckName={deck.name}
              />
            </FadeTransition>
          )}
        </AnimatePresence>
      </main>
    </PageLayout>
  );
}
