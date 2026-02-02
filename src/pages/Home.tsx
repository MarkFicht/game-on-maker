// Home Page - Main entry point
import { motion } from 'framer-motion';
import { Play, Settings, Crown, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SoundToggle } from '@/components/SoundToggle';
import { useHasRemoveAds } from '@/hooks/usePremium';
import { audioService } from '@/services/audio';

export default function Home() {
  const navigate = useNavigate();
  const hasRemoveAds = useHasRemoveAds();
  
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background safe-top safe-bottom safe-x">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <SoundToggle />
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-xl font-bold text-foreground"
        >
          WordRush
        </motion.h1>
        <Link to="/settings">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Logo area */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="text-center"
        >
          <span className="text-8xl mb-4 block">🎯</span>
          <h2 className="font-display text-4xl font-bold text-gradient-primary mb-2">
            WordRush
          </h2>
          <p className="text-muted-foreground">
            Guess the word before time runs out!
          </p>
        </motion.div>
        
        {/* Play button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full max-w-xs"
        >
          <Button
            size="lg"
            onClick={() => {
              audioService.play('tap');
              navigate('/decks');
            }}
            className="w-full h-16 text-xl font-bold btn-game rounded-2xl glow text-primary-foreground"
          >
            <Play className="w-6 h-6 mr-3" fill="currentColor" />
            Play Now
          </Button>
        </motion.div>
        
        {/* Quick stats or premium upsell */}
        {!hasRemoveAds && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/paywall">
              <Button
                onClick={() => audioService.play('tap')}
                variant="outline"
                className="rounded-xl border-secondary/50 hover:border-secondary text-secondary hover:bg-secondary/10"
              >
                <Crown className="w-4 h-4 mr-2" />
                Go Premium
              </Button>
            </Link>
          </motion.div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="p-4 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 text-muted-foreground text-sm"
        >
          <Zap className="w-4 h-4" />
          <span>Party game for friends</span>
        </motion.div>
      </footer>
    </div>
  );
}
