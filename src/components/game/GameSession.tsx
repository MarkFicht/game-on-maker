// Game Session Layout - Main playing state with grid layout
import { TimerRing, WordCard, GameActions } from '@/components/game';
import type { Word, GameState, GameStats } from '@/game/types';

interface GameSessionProps {
  word: Word | null;
  deckIcon: string;
  state: GameState;
  stats: GameStats;
  onCorrect: () => void;
  onSkip: () => void;
  onPause: () => void;
}

export function GameSession({
  word,
  deckIcon,
  state,
  stats,
  onCorrect,
  onSkip,
  onPause,
}: GameSessionProps) {
  return (
    <div className="w-full h-full flex flex-col gap-2 md:gap-3 lg:gap-4 [@media(orientation:landscape)_and_(max-height:500px)]:gap-2">
      {/* Top section - Timer, Score and Pause in one row (landscape mobile) */}
      <div className="flex flex-col [@media(orientation:landscape)_and_(max-height:500px)]:flex-row items-center [@media(orientation:landscape)_and_(max-height:500px)]:justify-center gap-1 md:gap-2 [@media(orientation:landscape)_and_(max-height:500px)]:gap-4 flex-shrink-0">
        {/* Timer */}
        <div>
          <TimerRing
            timeRemaining={state.timeRemaining}
            totalTime={state.totalTime}
            size={60}
            strokeWidth={5}
          />
        </div>

        {/* Score indicator */}
        <div className="inline-flex gap-4 md:gap-6 [@media(orientation:landscape)_and_(max-height:500px)]:gap-3 overlay-dark rounded-lg py-2 px-2.5 md:py-3 md:px-4 [@media(orientation:landscape)_and_(max-height:500px)]:py-1.5 [@media(orientation:landscape)_and_(max-height:500px)]:px-3">
          <div className="text-center">
            <p className="text-xl md:text-2xl [@media(orientation:landscape)_and_(max-height:500px)]:text-lg font-bold text-success">{stats.correctCount}</p>
            <p className="text-xs [@media(orientation:landscape)_and_(max-height:500px)]:text-[10px] text-muted-foreground">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl [@media(orientation:landscape)_and_(max-height:500px)]:text-lg font-bold text-warning">{stats.skippedCount}</p>
            <p className="text-xs [@media(orientation:landscape)_and_(max-height:500px)]:text-[10px] text-muted-foreground">Skipped</p>
          </div>
        </div>
        
        {/* Pause Button - shown in landscape mode */}
        <div className="hidden [@media(orientation:landscape)_and_(max-height:500px)]:block">
          <GameActions onPause={onPause} />
        </div>
      </div>

      {/* Middle section - Word Card (takes most space) */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <WordCard 
          word={word} 
          deckIcon={deckIcon}
          onCorrect={onCorrect}
          onSkip={onSkip}
        />
      </div>

      {/* Bottom section - Pause Button (hidden in landscape) */}
      <div className="flex justify-center [@media(orientation:landscape)_and_(max-height:500px)]:hidden">
        <GameActions onPause={onPause} />
      </div>
    </div>
  );
}
