// Results Screen Content
import { motion } from 'framer-motion';
import { Trophy, Check, X, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tappable, DelayedFadeIn } from '@/components/animated';
import { StatCard } from '@/components/ui/stat-card';
import type { GameStats, RoundResult } from '@/game/types';

interface ResultsViewProps {
  stats: GameStats;
  results: RoundResult[];
  onPlayAgain: () => void;
  onHome: () => void;
  deckName?: string;
}

export function ResultsView({ 
  stats, 
  results, 
  onPlayAgain, 
  onHome,
  deckName 
}: ResultsViewProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto h-full">
      {/* Trophy & Score */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="mb-4"
      >
        <div className="relative">
          <Trophy className="w-16 h-16 text-warning" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-success text-success-foreground text-sm font-bold px-3 py-1 rounded-full"
          >
            {stats.correctCount}
          </motion.div>
        </div>
      </motion.div>
      
      <DelayedFadeIn delay={0.2} className="font-display text-2xl font-bold text-foreground mb-1">
        {stats.correctCount >= 10 ? 'Amazing!' : stats.correctCount >= 5 ? 'Great Job!' : 'Good Try!'}
      </DelayedFadeIn>
      
      {deckName && (
        <p className="text-muted-foreground mb-4 text-sm">{deckName}</p>
      )}
      
      {/* Stats */}
      <DelayedFadeIn delay={0.3} className="grid grid-cols-3 gap-3 w-full mb-4">
        <StatCard icon={Check} iconColor="text-success" value={stats.correctCount} label="Correct" />
        <StatCard icon={X} iconColor="text-warning" value={stats.skippedCount} label="Skipped" />
        <StatCard icon={Trophy} iconColor="text-accent" value={`${stats.accuracy}%`} label="Accuracy" />
      </DelayedFadeIn>
      
      {/* Word list - with min height and max height based on viewport */}
      <DelayedFadeIn 
        delay={0.4} 
        y={0}
        className="w-full mb-4 overflow-y-auto no-scrollbar"
        style={{ minHeight: '150px', maxHeight: 'calc(100vh - 500px)' }}
      >
        <div className="space-y-2">
          {results.map((result, index) => (
            <motion.div
              key={result.word.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
            >
              {result.wasCorrect ? (
                <Check className="w-4 h-4 text-success shrink-0" />
              ) : (
                <X className="w-4 h-4 text-warning shrink-0" />
              )}
              <span className="text-sm text-foreground truncate">{result.word.text}</span>
            </motion.div>
          ))}
        </div>
      </DelayedFadeIn>
      
      {/* Actions */}
      <DelayedFadeIn delay={0.6} className="flex gap-3 w-full">
        <Tappable className="flex-1">
          <Button
            variant="outline"
            size="lg"
            onClick={onHome}
            className="w-full h-12 rounded-xl"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </Tappable>
        <Tappable className="flex-1">
          <Button
            size="lg"
            onClick={onPlayAgain}
            className="w-full h-12 btn-game rounded-xl text-primary-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
        </Tappable>
      </DelayedFadeIn>
    </div>
  );
}
