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
    <div className={`w-full h-full flex flex-col gap-2 md:gap-3 lg:gap-4 landscape-sm:gap-2`}>
      {/* Top section - Timer, Score and Pause (row in landscape) */}
      <div className={`flex flex-col landscape-sm:flex-row items-center landscape-sm:justify-center gap-1 md:gap-2 landscape-sm:gap-4 flex-shrink-0`}>
        <TimerRing timeRemaining={state.timeRemaining} totalTime={state.totalTime} size={60} strokeWidth={5} />
        
        <div 
          className={`inline-flex gap-4 md:gap-6 landscape-sm:gap-3 overlay-dark rounded-lg py-2 px-2.5 md:py-3 md:px-4 landscape-sm:py-1.5 landscape-sm:px-3`}
          style={{
            boxShadow: '0 1px 0 rgba(255, 255, 255, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3), inset 0 6px 10px rgba(255, 255, 255, 0.2), inset 0 -8px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="text-center">
            <p className={`text-xl md:text-2xl landscape-sm:text-lg font-bold text-success`}>{stats.correctCount}</p>
            <p className={`text-xs landscape-sm:text-[10px] text-muted-foreground`}>Correct</p>
          </div>
          <div className="text-center">
            <p className={`text-xl md:text-2xl landscape-sm:text-lg font-bold text-warning`}>{stats.skippedCount}</p>
            <p className={`text-xs landscape-sm:text-[10px] text-muted-foreground`}>Skipped</p>
          </div>
        </div>
        
        <div className={`hidden landscape-sm:block`}>
          <GameActions onPause={onPause} />
        </div>
      </div>

      {/* Word Card */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <WordCard word={word} deckIcon={deckIcon} onCorrect={onCorrect} onSkip={onSkip} />
      </div>

      {/* Pause Button (hidden in landscape) */}
      <div className={`flex justify-center landscape-sm:hidden`}>
        <GameActions onPause={onPause} />
      </div>
    </div>
  );
}
