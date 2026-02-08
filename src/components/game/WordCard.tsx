// Word Card Component - The main game display with integrated action zones
import { useState, useEffect } from 'react';
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

// Landscape mobile media query
const lsm = '[@media(orientation:landscape)_and_(max-height:500px)]';

// Animation variants
const pulseAnim = { opacity: [0.95, 1, 0.95], scale: [1, 1.15, 1] };
const fadeInScale = { opacity: 1, scale: 1 };
const fadeOutScale = { opacity: 0, scale: 0.8 };
const buttonBase = `flex-1 basis-1/2 ${lsm}:h-[100px] ${lsm}:min-h-[100px] flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 ${lsm}:p-1 no-select cursor-pointer transition-all relative`;

interface ZoneProps {
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
  bgColor: string;
  position: 'top' | 'bottom';
  textColor: string;
  onHover: (active: boolean) => void;
  onClick: () => void;
  hasBorder?: boolean;
}

function Zone({ isActive, icon, label, bgColor, position, textColor, onHover, onClick, hasBorder }: ZoneProps) {
  const posClass = position === 'top' ? 'top-3 right-3 md:top-4 md:right-4' : 'bottom-3 right-3 md:bottom-4 md:right-4';
  return (
    <motion.button
      onHoverStart={() => onHover(true)}
      onHoverEnd={() => onHover(false)}
      onClick={onClick}
      className={buttonBase}
    >
      {hasBorder && <div className={`absolute top-0 left-0 right-0 h-0 border-t-4 ${lsm}:border-t-2 border-dashed border-border/85`}></div>}
      <motion.div animate={{ backgroundColor: isActive ? bgColor : 'rgba(0, 0, 0, 0)' }} transition={{ type: 'tween', duration: 0.4 }} className="absolute inset-0" />
      <motion.div className={`absolute pointer-events-none ${posClass}`} animate={isActive ? { opacity: 0, scale: 0.5 } : pulseAnim} transition={{ duration: isActive ? 0.3 : 2, repeat: isActive ? 0 : Infinity }}>
        {icon}
      </motion.div>
      <motion.div className="relative z-10 flex flex-col items-center justify-center" initial={fadeOutScale} animate={isActive ? fadeInScale : fadeOutScale} transition={{ duration: 0.3 }}>
        {icon}
        <span className={`${textColor} font-bold text-xl md:text-2xl mt-2`}>{label}</span>
      </motion.div>
    </motion.button>
  );
}

export function WordCard({ word, deckIcon, onCorrect, onSkip, allowSkip = true }: WordCardProps) {
  const [hoverZone, setHoverZone] = useState<'top' | 'bottom' | null>(null);
  const [tiltZone, setTiltZone] = useState<'top' | 'bottom' | null>(null);

  useEffect(() => {
    setTiltZone(null);
    setHoverZone(null);
  }, [word?.id]);

  const handleZoneClick = (zone: 'top' | 'bottom', callback?: () => void) => {
    setTiltZone(zone);
    setHoverZone(zone);
    setTimeout(() => callback?.(), 500);
  };

  return (
    <motion.div 
      className={`w-full h-full max-w-4xl ${lsm}:h-[200px]`}
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
              rotateX: tiltZone === 'top' ? -15 : tiltZone === 'bottom' ? 15 : (hoverZone === 'top' ? -15 : hoverZone === 'bottom' ? 15 : 0)
            }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.25 }}
            className={`relative w-full h-full ${lsm}:h-[200px] word-card rounded-2xl overflow-hidden flex flex-col`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Correct Zone - Top Half */}
            <Zone
              isActive={hoverZone === 'top'}
              icon={<Check className="w-10 h-10 md:w-12 md:h-12 text-success" />}
              label="Got it!"
              bgColor="rgba(34, 197, 94, 0.6)"
              position="top"
              textColor="text-success"
              onHover={(active) => setHoverZone(active ? 'top' : null)}
              onClick={() => handleZoneClick('top', onCorrect)}
            />

            {/* Word text - Center overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 pointer-events-none z-20">
              {deckIcon && (
                <span className="absolute top-4 left-4 text-3xl emoji-outlined-md opacity-90">
                  {deckIcon}
                </span>
              )}
              
              <h2 className={`font-display text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl ${lsm}:text-2xl font-bold text-center text-foreground leading-tight`}>
                {word.text}
              </h2>
              
              {word.category && (
                <p className="mt-4 text-muted-foreground text-sm uppercase tracking-wider">
                  {word.category}
                </p>
              )}
            </div>

            {/* Skip Zone - Bottom Half */}
            {allowSkip && (
              <Zone
                isActive={hoverZone === 'bottom'}
                icon={<X className="w-10 h-10 md:w-12 md:h-12 text-warning" />}
                label="Pass"
                bgColor="rgba(180, 83, 9, 0.6)"
                position="bottom"
                textColor="text-warning"
                onHover={(active) => setHoverZone(active ? 'bottom' : null)}
                onClick={() => handleZoneClick('bottom', onSkip)}
                hasBorder
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
