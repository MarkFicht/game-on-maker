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

// Landscape mobile media query
const lsm = '[@media(orientation:landscape)_and_(max-height:500px)]';

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
    <div className={`w-full h-full flex flex-col gap-2 md:gap-3 lg:gap-4 ${lsm}:gap-2`}>
      {/* Top section - Timer, Score and Pause (row in landscape) */}
      <div className={`flex flex-col ${lsm}:flex-row items-center ${lsm}:justify-center gap-1 md:gap-2 ${lsm}:gap-4 flex-shrink-0`}>
        <TimerRing timeRemaining={state.timeRemaining} totalTime={state.totalTime} size={60} strokeWidth={5} />
        
        <div className={`inline-flex gap-4 md:gap-6 ${lsm}:gap-3 overlay-dark rounded-lg py-2 px-2.5 md:py-3 md:px-4 ${lsm}:py-1.5 ${lsm}:px-3`}>
          <div className="text-center">
            <p className={`text-xl md:text-2xl ${lsm}:text-lg font-bold text-success`}>{stats.correctCount}</p>
            <p className={`text-xs ${lsm}:text-[10px] text-muted-foreground`}>Correct</p>
          </div>
          <div className="text-center">
            <p className={`text-xl md:text-2xl ${lsm}:text-lg font-bold text-warning`}>{stats.skippedCount}</p>
            <p className={`text-xs ${lsm}:text-[10px] text-muted-foreground`}>Skipped</p>
          </div>
        </div>
        
        <div className={`hidden ${lsm}:block`}>
          <GameActions onPause={onPause} />
        </div>
      </div>

      {/* Word Card */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <WordCard word={word} deckIcon={deckIcon} onCorrect={onCorrect} onSkip={onSkip} />
      </div>

      {/* Pause Button (hidden in landscape) */}
      <div className={`flex justify-center ${lsm}:hidden`}>
        <GameActions onPause={onPause} />
      </div>
    </div>
  );
}
