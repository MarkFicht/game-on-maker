// Home Page - Main entry point
import { Play, Settings, Crown, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SoundToggle } from '@/components/SoundToggle';
import { PageLayout } from '@/components/PageLayout';
import { FadeIn, scaleIn, Tappable } from '@/components/animated';
import { withAudio } from '@/lib/audio-helpers';
import { usePremium } from '@/hooks/usePremium';
import { audioService } from '@/services/audio';

export default function Home() {
  const navigate = useNavigate();
  const { status } = usePremium();
  const isFullPremium = status.hasRemoveAds && status.hasPremiumDecks;
  
  return (
    <PageLayout>
      {/* Header */}
      <header className="flex items-center justify-between p-4 overlay-dark">
        <Link to="/settings">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white"
            onClick={() => audioService.play('tap')}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-xl font-bold text-gradient-primary"
        >
          WordRush
        </motion.h1>
        <SoundToggle />
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Logo area */}
        <motion.div
          {...scaleIn}
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
        <FadeIn delay={0.2} className="w-full max-w-xs">
          <Tappable>
            <Button
              size="lg"
              onClick={withAudio('tap', () => navigate('/decks'))}
              className="w-full h-16 text-xl font-bold btn-game rounded-2xl glow text-primary-foreground"
            >
              <Play className="w-6 h-6 mr-3" fill="currentColor" />
              Play Now
            </Button>
          </Tappable>
        </FadeIn>
        
        {/* Quick stats or premium upsell */}
        <FadeIn delay={0.3}>
          <Link to={isFullPremium ? "/premium-summary" : "/paywall"}>
            <Button
              onClick={withAudio('tap', () => {})}
              variant="outline"
              className={`rounded-xl ${
                isFullPremium 
                  ? 'border-success/50 text-success hover:border-success hover:bg-success/20 hover:text-white' 
                  : 'border-secondary/50 hover:border-secondary text-secondary hover:bg-secondary/20 hover:text-secondary-foreground'
              }`}
            >
              <span className="mr-0 -mt-1">👑</span>
              {isFullPremium ? 'Premium User' : 'Go Premium'}
            </Button>
          </Link>
        </FadeIn>
      </main>
      
      {/* Footer */}
      <footer className="p-4 text-center">
        <FadeIn delay={0.4} className="flex items-center justify-center gap-2 text-white text-sm">
          <Zap className="w-4 h-4" />
          <span>Party game for friends</span>
        </FadeIn>
      </footer>
    </PageLayout>
  );
}
