// Circular Timer Component
import { motion } from 'framer-motion';
import { formatTime } from '@/game/utils';

interface TimerRingProps {
  timeRemaining: number;
  totalTime: number;
  size?: number;
  strokeWidth?: number;
}

export function TimerRing({ 
  timeRemaining, 
  totalTime, 
  size = 120, 
  strokeWidth = 8 
}: TimerRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = timeRemaining / totalTime;
  const strokeDashoffset = circumference * (1 - progress);
  
  // Color changes as time runs out
  const getColor = () => {
    if (progress > 0.5) return 'hsl(var(--success))';
    if (progress > 0.25) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };
  
  const isLowTime = progress <= 0.25;
  
  return (
    <motion.div 
      className="relative inline-flex items-center justify-center"
      animate={isLowTime ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="timer-ring transition-colors duration-300"
          strokeLinecap="round"
        />
      </svg>
      
      {/* Time display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className="font-display text-3xl font-bold transition-colors duration-300"
          style={{ color: getColor() }}
        >
          {formatTime(timeRemaining)}
        </span>
      </div>
    </motion.div>
  );
}
