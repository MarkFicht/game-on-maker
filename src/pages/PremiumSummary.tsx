// Premium Summary - Thank you page for premium users
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/BackButton';
import { PageLayout } from '@/components/PageLayout';
import { Tappable, DelayedFadeIn, FadeIn } from '@/components/animated';
import { withAudio } from '@/lib/audio-helpers';
import { track } from '@/services/analytics';
import { PageHeader } from '@/components/PageHeader';

export default function PremiumSummary() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <PageHeader title="Premium User" backTo="/" />
      
      {/* Content */}
      <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 text-center gap-6">
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
              className="w-full h-16 text-xl font-bold btn-game rounded-2xl btn-3d glow text-primary-foreground"
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
              size='lg'
              className="mx-auto h-12 text-base px-6 rounded-2xl btn-3d hover:bg-accent/75"
            >
              <span className="">⭐</span> Rate Us
            </Button>
          </Tappable>
        </DelayedFadeIn>
      </main>

        {/* Footer */}
      <footer className="p-3 text-center">
        <FadeIn delay={0.4} className="flex items-center justify-center gap-2 text-white text-sm">
          <span>Thank You</span>
        </FadeIn>
      </footer>
    </PageLayout>
  );
}
