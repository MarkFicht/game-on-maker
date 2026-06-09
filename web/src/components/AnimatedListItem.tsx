// Animated list item component to reduce repetitive motion code
import { motion } from 'framer-motion';
import { slideInLeft } from './animated';
import { ReactNode } from 'react';

interface AnimatedListItemProps {
  children: ReactNode;
  index: number;
  baseDelay?: number;
  delayIncrement?: number;
}

export function AnimatedListItem({ 
  children, 
  index, 
  baseDelay = 0, 
  delayIncrement = 0.1 
}: AnimatedListItemProps) {
  return (
    <motion.div 
      {...slideInLeft} 
      transition={{ delay: baseDelay + index * delayIncrement }}
    >
      {children}
    </motion.div>
  );
}
