// Game Action Buttons
import { motion } from 'framer-motion';
import { Check, X, Pause, Play, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="lg"
            onClick={onResume}
            className="btn-game h-16 px-12 text-xl font-semibold text-primary-foreground rounded-2xl"
          >
            <Play className="w-6 h-6 mr-2" />
            Resume
          </Button>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
      {/* Main action buttons */}
      <div className="flex gap-4">
        {/* Skip button */}
        {allowSkip && (
          <motion.div 
            className="flex-1"
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="lg"
              onClick={onSkip}
              className="btn-skip w-full h-20 text-xl font-bold text-warning-foreground rounded-2xl"
            >
              <SkipForward className="w-7 h-7 mr-2" />
              Pass
            </Button>
          </motion.div>
        )}
        
        {/* Correct button */}
        <motion.div 
          className="flex-1"
          whileTap={{ scale: 0.98 }}
        >
          <Button
            size="lg"
            onClick={onCorrect}
            className="btn-success w-full h-20 text-xl font-bold text-success-foreground rounded-2xl"
          >
            <Check className="w-7 h-7 mr-2" />
            Correct!
          </Button>
        </motion.div>
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
