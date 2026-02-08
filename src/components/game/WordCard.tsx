// Word Card Component - The main game display with integrated action zones
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { Word } from '@/game/types';

interface WordCardProps {
  word: Word | null;
  deckIcon?: string;
  onCorrect?: () => void;
  onSkip?: () => void;
  allowSkip?: boolean;
}

export function WordCard({ word, deckIcon, onCorrect, onSkip, allowSkip = true }: WordCardProps) {
  const [hoverZone, setHoverZone] = useState<'top' | 'bottom' | null>(null);

  return (
    <motion.div 
      className="w-full h-full max-w-4xl flex items-center justify-center"
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
    >
      <AnimatePresence mode="wait">
        {word && (
          <motion.div
            key={word.id}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ 
              rotateY: 0, 
              opacity: 1,
              rotateX: hoverZone === 'top' ? -15 : hoverZone === 'bottom' ? 15 : 0 
            }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 25,
              duration: 0.25
            }}
            className="relative w-full h-full word-card rounded-2xl overflow-hidden flex flex-col"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Correct Zone - Top Half */}
            <motion.button
              onHoverStart={() => setHoverZone('top')}
              onHoverEnd={() => setHoverZone(null)}
              onClick={() => {
                setHoverZone('top');
                setTimeout(() => onCorrect?.(), 500);
                setTimeout(() => setHoverZone(null), 600);
              }}
              className="flex-1 flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 no-select cursor-pointer transition-all relative"
            >
              <motion.div
                animate={{ backgroundColor: hoverZone === 'top' ? 'rgba(34, 197, 94, 0.6)' : 'rgba(0, 0, 0, 0)' }}
                transition={{ type: 'tween', duration: 0.4, ease: 'easeInOut' }}
                className="absolute inset-0 pointer-events-none"
              />
              
              {/* Small corner icon - always visible */}
              <motion.div
                className="absolute top-3 right-3 md:top-4 md:right-4 pointer-events-none"
                animate={{
                  opacity: hoverZone === 'top' ? 0 : [0.95, 1, 0.95],
                  scale: hoverZone === 'top' ? 0.5 : [1, 1.15, 1]
                }}
                transition={{ 
                  duration: hoverZone === 'top' ? 0.3 : 2,
                  repeat: hoverZone === 'top' ? 0 : Infinity,
                  ease: "easeInOut"
                }}
              >
                <Check className="w-10 h-10 md:w-12 md:h-12 text-success" />
              </motion.div>

              {/* Center icon - shown on hover */}
              <motion.div 
                className="relative z-10 flex flex-col items-center justify-center"
                animate={{ 
                  opacity: hoverZone === 'top' ? 1 : 0,
                  scale: hoverZone === 'top' ? 1 : 0.8
                }}
                transition={{ duration: 0.3 }}
              >
                <Check className="w-16 h-16 md:w-20 md:h-20 text-success" />
                <span className="text-success font-bold text-xl md:text-2xl mt-2">Got it!</span>
              </motion.div>
            </motion.button>

            {/* Word text - Center overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 pointer-events-none z-20">
              {/* Deck icon */}
              {deckIcon && (
                <span className="absolute top-4 left-4 text-3xl emoji-outlined-md opacity-90">
                  {deckIcon}
                </span>
              )}
              
              {/* Word text */}
              <h2 className="font-display text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-center text-foreground leading-tight">
                {word.text}
              </h2>
              
              {/* Category if available */}
              {word.category && (
                <p className="mt-4 text-muted-foreground text-sm uppercase tracking-wider">
                  {word.category}
                </p>
              )}
            </div>

            {/* Skip Zone - Bottom Half */}
            {allowSkip && (
              <motion.button
                onHoverStart={() => setHoverZone('bottom')}
                onHoverEnd={() => setHoverZone(null)}
                onClick={() => {
                  setHoverZone('bottom');
                  setTimeout(() => onSkip?.(), 500);
                  setTimeout(() => setHoverZone(null), 600);
                }}
                className="flex-1 flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 no-select cursor-pointer transition-all relative border-t-4 border-dashed border-border/85"
              >
                <motion.div
                  animate={{ backgroundColor: hoverZone === 'bottom' ? 'rgba(180, 83, 9, 0.6)' : 'rgba(0, 0, 0, 0)' }}
                  transition={{ type: 'tween', duration: 0.4, ease: 'easeInOut' }}
                  className="absolute inset-0 pointer-events-none"
                />
                
                {/* Small corner icon - always visible */}
                <motion.div
                  className="absolute bottom-3 right-3 md:bottom-4 md:right-4 pointer-events-none"
                  animate={{
                    opacity: hoverZone === 'bottom' ? 0 : [0.95, 1, 0.95],
                    scale: hoverZone === 'bottom' ? 0.5 : [1, 1.15, 1]
                  }}
                  transition={{ 
                    duration: hoverZone === 'bottom' ? 0.3 : 2,
                    repeat: hoverZone === 'bottom' ? 0 : Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <X className="w-10 h-10 md:w-12 md:h-12 text-warning" />
                </motion.div>

                {/* Center icon - shown on hover */}
                <motion.div 
                  className="relative z-10 flex flex-col items-center justify-center"
                  animate={{ 
                    opacity: hoverZone === 'bottom' ? 1 : 0,
                    scale: hoverZone === 'bottom' ? 1 : 0.8
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <X className="w-16 h-16 md:w-20 md:h-20 text-warning" />
                  <span className="text-warning font-bold text-xl md:text-2xl mt-2">Pass</span>
                </motion.div>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
