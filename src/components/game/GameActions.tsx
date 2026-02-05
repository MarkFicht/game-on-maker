// Game Action Buttons
import { Check, Pause, Play, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tappable } from '@/components/animated';

interface GameActionsProps {
  onCorrect: () => void;
  onSkip: () => void;
  onPause: () => void;
  allowSkip?: boolean;
}

export function GameActions({ 
  onCorrect, 
  onSkip, 
  onPause, 
  allowSkip = true 
}: GameActionsProps) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
      {/* Main action buttons */}
      <div className="flex gap-2">
        {/* Skip button */}
        {allowSkip && (
          <Tappable className="flex-1">
            <Button
              size="lg"
              onClick={onSkip}
              className="w-full px-2 h-16 text-lg font-bold btn-game rounded-xl border-4 border-white glow text-primary-foreground hover:border-primary"
            >
              <SkipForward className="w-5 h-5" />
              Pass
            </Button>
          </Tappable>
        )}
        
        {/* Correct button */}
        <Tappable className="flex-1">
          <Button
            size="lg"
            onClick={onCorrect}
            className="w-full px-2 h-16 text-lg font-bold btn-success text-success-foreground rounded-xl border-4 border-white glow hover:border-success"
          >
            <Check className="w-5 h-5" />
            Got it!
          </Button>
        </Tappable>
      </div>
      
      {/* Pause button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onPause}
        className="mx-auto px-8 rounded-lg border-4 border-white hover:border-accent hover:bg-accent/75"
      >
        <Pause className="w-4 h-4" />
        Pause
      </Button>
    </div>
  );
}
