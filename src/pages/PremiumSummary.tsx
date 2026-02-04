// Premium Summary - Thank you page for premium users
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/BackButton';
import { PageLayout } from '@/components/PageLayout';
import { Tappable, DelayedFadeIn } from '@/components/animated';
import { withAudio } from '@/lib/audio-helpers';
import { track } from '@/services/analytics';

export default function PremiumSummary() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <header className="flex items-center gap-4 p-4 overlay-dark">
        <BackButton to="/" />
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-6">
        <DelayedFadeIn delay={0}>
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
            className="inline-flex items-center justify-center"
          >
            <div className="text-6xl -mt-1">👑</div>
          </motion.div>
        </DelayedFadeIn>
        
        <DelayedFadeIn delay={0.1}>
          <h2 className="font-display text-3xl font-bold text-gradient-premium mb-2">
            You're Premium!
          </h2>
          <p className="text-muted-foreground">
            Thanks for supporting WordRush
          </p>
        </DelayedFadeIn>
        
        <DelayedFadeIn delay={0.2} className="w-full max-w-xs">
          <Tappable>
            <Button 
              onClick={withAudio('tap', () => navigate('/'))} 
              className="w-full h-16 text-xl font-bold btn-game rounded-2xl glow text-primary-foreground"
              size="lg"
            >
              Continue Playing
            </Button>
          </Tappable>
        </DelayedFadeIn>
        
        <DelayedFadeIn delay={0.3}>
          <Tappable>
            <Button 
              onClick={withAudio('tap', () => {
                track('review_clicked');
                window.open('https://play.google.com/store/apps/details?id=your.app.id', '_blank');
              })}
              variant="outline"
              className="w-full rounded-xl"
            >
              <span className="mr-1">⭐</span> Rate Us
            </Button>
          </Tappable>
        </DelayedFadeIn>
      </main>
    </PageLayout>
  );
}
