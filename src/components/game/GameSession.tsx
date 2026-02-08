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
    <div className="w-full h-full flex flex-col gap-2 md:gap-3 lg:gap-4">
      {/* Top section - Timer and Score */}
      <div className="flex flex-col items-center gap-1 md:gap-2 flex-shrink-0">
        {/* Timer */}
        <div>
          <div className="md:hidden">
            <TimerRing
              timeRemaining={state.timeRemaining}
              totalTime={state.totalTime}
              size={60}
              strokeWidth={5}
            />
          </div>
          <div className="hidden md:block">
            <TimerRing
              timeRemaining={state.timeRemaining}
              totalTime={state.totalTime}
              size={100}
              strokeWidth={7}
            />
          </div>
        </div>

        {/* Score indicator */}
        <div className="inline-flex gap-4 md:gap-6 overlay-dark rounded-lg py-2 px-2.5 md:py-3 md:px-4">
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-success">{stats.correctCount}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-warning">{stats.skippedCount}</p>
            <p className="text-xs text-muted-foreground">Skipped</p>
          </div>
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

      {/* Bottom section - Pause Button */}
      <div className="flex justify-center">
        <GameActions onPause={onPause} />
      </div>
    </div>
  );
}
