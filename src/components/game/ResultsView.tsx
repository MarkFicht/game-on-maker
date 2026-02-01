// Results Screen Content
import { motion } from 'framer-motion';
import { Trophy, Check, X, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Trophy & Score */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative">
          <Trophy className="w-20 h-20 text-warning" />
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
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-display text-3xl font-bold text-foreground mb-2"
      >
        {stats.correctCount >= 10 ? 'Amazing!' : stats.correctCount >= 5 ? 'Great Job!' : 'Good Try!'}
      </motion.h2>
      
      {deckName && (
        <p className="text-muted-foreground mb-6">{deckName}</p>
      )}
      
      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-4 w-full mb-8"
      >
        <div className="game-card p-4 text-center">
          <Check className="w-5 h-5 text-success mx-auto mb-1" />
          <p className="font-display text-2xl font-bold text-foreground">{stats.correctCount}</p>
          <p className="text-xs text-muted-foreground">Correct</p>
        </div>
        <div className="game-card p-4 text-center">
          <X className="w-5 h-5 text-warning mx-auto mb-1" />
          <p className="font-display text-2xl font-bold text-foreground">{stats.skippedCount}</p>
          <p className="text-xs text-muted-foreground">Skipped</p>
        </div>
        <div className="game-card p-4 text-center">
          <Trophy className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="font-display text-2xl font-bold text-foreground">{stats.accuracy}%</p>
          <p className="text-xs text-muted-foreground">Accuracy</p>
        </div>
      </motion.div>
      
      {/* Word list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full mb-8 max-h-48 overflow-y-auto no-scrollbar"
      >
        <div className="space-y-2">
          {results.map((result, index) => (
            <motion.div
              key={result.word.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
            >
              {result.wasCorrect ? (
                <Check className="w-4 h-4 text-success shrink-0" />
              ) : (
                <X className="w-4 h-4 text-warning shrink-0" />
              )}
              <span className="text-foreground truncate">{result.word.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-4 w-full"
      >
        <Button
          variant="outline"
          size="lg"
          onClick={onHome}
          className="flex-1 h-14 rounded-xl"
        >
          <Home className="w-5 h-5 mr-2" />
          Home
        </Button>
        <Button
          size="lg"
          onClick={onPlayAgain}
          className="flex-1 h-14 btn-game rounded-xl text-primary-foreground"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Play Again
        </Button>
      </motion.div>
    </div>
  );
}
