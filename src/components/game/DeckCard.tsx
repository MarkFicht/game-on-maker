// Deck Selection Card
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import type { Deck } from '@/game/types';
import { cn } from '@/lib/utils';

interface DeckCardProps {
  deck: Deck;
  onSelect: (deck: Deck) => void;
  isLocked?: boolean;
  onUnlock?: () => void;
  showWordCount?: boolean;
}

export function DeckCard({ deck, onSelect, isLocked, onUnlock, showWordCount = true }: DeckCardProps) {
  const handleClick = () => {
    if (isLocked) {
      onUnlock?.();
      return;
    }
    onSelect(deck);
  };
  
  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "game-card w-full p-3 text-left transition-all relative overflow-hidden md:pl-4 btn-3d"
      )}
    >
      {/* Background gradient overlay */}
      <div className={cn("absolute inset-0 opacity-10", `bg-${deck.color}`)} />

      {isLocked && 
        <div className={cn("absolute z-10 inset-0 flex items-center justify-center text-4xl emoji-outlined-sm")}>
          🔒
        </div>
      }
      
      <div className={cn("relative flex items-start gap-4", isLocked && "opacity-45")}>
        {/* Icon */}
        <span className="text-4xl emoji-outlined-sm">{deck.icon}</span>
        
        {/* Content */}
        <div className="flex-1 min-w-0 pr-3 sm:pr-7 md:pr-12">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold text-foreground truncate">
              {deck.name}
            </h3>
            {isLocked && (
              <Lock className="w-4 h-4 text-secondary shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {deck.description}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {showWordCount && deck.words.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {deck.words.length} words
              </p>
            )}
            {/* Premium badge inline */}
            {deck.isPremium && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full premium-gradient text-white whitespace-nowrap">
                PRO
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
