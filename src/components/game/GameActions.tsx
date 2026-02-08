// Game Action Buttons - Pause only (Correct/Skip integrated into WordCard)
import { Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameActionsProps {
  onPause: () => void;
}

export function GameActions({ onPause }: GameActionsProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onPause}
      className="mx-auto px-8 rounded-lg border-4 border-white hover:border-accent hover:bg-accent/75"
    >
      <Pause className="w-4 h-4" />
      Pause
    </Button>
  );
}
