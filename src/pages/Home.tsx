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
import { PageHeader } from '@/components/PageHeader';

export default function Home() {
  const navigate = useNavigate();
  const { status } = usePremium();
  const isFullPremium = status.hasRemoveAds && status.hasPremiumDecks;
  
  return (
    <PageLayout>
      {/* Header */}
      <PageHeader title="WordRush" backTo="/settings" />
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 gap-6">
        {/* Logo area */}
        <motion.div
          {...scaleIn}
          transition={{ type: 'spring', delay: 0.1 }}
          className="text-center mb-2"
        >
          <span className="text-8xl mb-4 block emoji-outlined-lg">🎯</span>
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
              className="w-full h-16 text-xl font-bold btn-game rounded-2xl border-4 border-white glow text-primary-foreground hover:border-primary"
            >
              <Play className="w-6 h-6 mr-1" fill="currentColor" />
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
                  ? 'border-4 bg-success/100 border-white/100 text-white hover:border-success hover:text-white hover:bg-success/80' 
                  : 'border-4 bg-secondary/100 border-white/100 text-white hover:border-secondary hover:text-white hover:bg-secondary/70'
              }`}
            >
              <span className="mr-0 -mt-1 emoji-outlined-sm">👑</span>
              {isFullPremium ? 'Premium User' : 'Go Premium'}
            </Button>
          </Link>
        </FadeIn>
      </main>
      
      {/* Footer */}
      <footer className="p-3 text-center">
        <FadeIn delay={0.4} className="flex items-center justify-center gap-2 text-white text-sm">
          <Zap className="w-3 h-3" />
          <span>Party game for friends</span>
        </FadeIn>
      </footer>
    </PageLayout>
  );
}
