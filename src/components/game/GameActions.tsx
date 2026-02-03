// Game Action Buttons
import { Check, Pause, Play, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tappable } from '@/components/animated';

interface GameActionsProps {
  onCorrect: () => void;
  onSkip: () => void;
  onPause: () => void;
  isPaused: boolean;
  onResume: () => void;
  allowSkip?: boolean;
}

export function GameActions({ 
  onCorrect, 
  onSkip, 
  onPause, 
  isPaused, 
  onResume,
  allowSkip = true 
}: GameActionsProps) {
  if (isPaused) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-muted-foreground mb-2">Game Paused</p>
        <Tappable>
          <Button
            size="lg"
            onClick={onResume}
            className="btn-game h-16 px-12 text-xl font-semibold text-primary-foreground rounded-2xl"
          >
            <Play className="w-6 h-6 mr-2" />
            Resume
          </Button>
        </Tappable>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto px-1">
      {/* Main action buttons */}
      <div className="flex gap-2">
        {/* Skip button */}
        {allowSkip && (
          <Tappable className="flex-1">
            <Button
              size="lg"
              onClick={onSkip}
              className="btn-skip w-full h-14 text-base font-bold text-warning-foreground rounded-xl px-2"
            >
              <SkipForward className="w-5 h-5" />
              <span className="ml-1">Pass</span>
            </Button>
          </Tappable>
        )}
        
        {/* Correct button */}
        <Tappable className="flex-1">
          <Button
            size="lg"
            onClick={onCorrect}
            className="btn-success w-full h-14 text-base font-bold text-success-foreground rounded-xl px-2"
          >
            <Check className="w-5 h-5" />
            <span className="ml-1">Got it!</span>
          </Button>
        </Tappable>
      </div>
      
      {/* Pause button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onPause}
        className="mx-auto text-muted-foreground hover:text-foreground"
      >
        <Pause className="w-4 h-4 mr-2" />
        Pause
      </Button>
    </div>
  );
}
