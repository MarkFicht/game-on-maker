// Reusable motion animations to reduce boilerplate
import { motion, type MotionProps } from 'framer-motion';
import { type ReactNode } from 'react';

// Common animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 }
};

// Reusable animated components
interface AnimatedSectionProps extends MotionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeInUp({ children, delay = 0, className, ...props }: AnimatedSectionProps) {
  return (
    <motion.section
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      exit={fadeInUp.exit}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
}

export function FadeIn({ children, delay = 0, className, ...props }: AnimatedSectionProps) {
  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      exit={fadeIn.exit}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Tappable({ children, className, ...props }: AnimatedSectionProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Standard fade-in with delay
export function DelayedFadeIn({ children, delay = 0, className, y = 20 }: AnimatedSectionProps & { y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade transition for AnimatePresence
export function FadeTransition({ children, className, itemKey }: AnimatedSectionProps & { itemKey: string }) {
  return (
    <motion.div
      key={itemKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
