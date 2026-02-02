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
}

export function DeckCard({ deck, onSelect, isLocked, onUnlock }: DeckCardProps) {
  const handleClick = () => {
    if (isLocked && onUnlock) {
      onUnlock();
    } else if (!isLocked) {
      onSelect(deck);
    }
  };
  
  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "game-card w-full p-5 text-left transition-all relative overflow-hidden",
        isLocked && "opacity-80"
      )}
    >
      {/* Background gradient overlay */}
      <div 
        className={cn(
          "absolute inset-0 opacity-10",
          deck.color === 'primary' && "bg-primary",
          deck.color === 'secondary' && "bg-secondary",
          deck.color === 'success' && "bg-success",
          deck.color === 'warning' && "bg-warning",
          deck.color === 'accent' && "bg-accent",
          deck.color === 'destructive' && "bg-destructive",
        )}
      />
      
      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <span className="text-4xl">{deck.icon}</span>
        
        {/* Content */}
        <div className="flex-1 min-w-0 pr-14">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold text-foreground truncate">
              {deck.name}
            </h3>
            {isLocked && (
              <Lock className="w-4 h-4 text-secondary shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {deck.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs text-muted-foreground">
              {deck.words.length} words
            </p>
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
