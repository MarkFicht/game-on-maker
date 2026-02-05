// Word Card Component - The main game display
import { motion, AnimatePresence } from 'framer-motion';
import type { Word } from '@/game/types';

interface WordCardProps {
  word: Word | null;
  deckIcon?: string;
}

export function WordCard({ word, deckIcon }: WordCardProps) {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] md:aspect-[5/3]">
      <AnimatePresence mode="wait">
        {word && (
          <motion.div
            key={word.id}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 25,
              duration: 0.25
            }}
            className="word-card absolute inset-0 flex flex-col items-center justify-center p-2 md:p-4 no-select"
          >
            {/* Deck icon */}
            {deckIcon && (
              <span className="absolute top-3 left-3 md:top-4 md:left-4 text-2xl md:text-3xl emoji-outlined-md opacity-90">
                {deckIcon}
              </span>
            )}
            
            {/* Word text */}
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-center text-foreground leading-tight">
              {word.text}
            </h2>
            
            {/* Category if available */}
            {word.category && (
              <p className="mt-4 text-muted-foreground text-sm uppercase tracking-wider">
                {word.category}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
