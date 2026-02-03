// Paywall Page - Premium purchase screen
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/BackButton';
import { usePremium } from '@/hooks/usePremium';
import { audioService } from '@/services/audio';
import { toast } from 'sonner';
import { track } from '@/services/analytics';
import { useEffect } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Tappable, DelayedFadeIn } from '@/components/animated';
import { withAudio } from '@/lib/audio-helpers';

const features = [
  { icon: Zap, text: 'Remove all ads' },
  { icon: Sparkles, text: 'Unlock premium decks' },
  { icon: Shield, text: 'Support development' },
];

export default function Paywall() {
  const navigate = useNavigate();
  const { products, purchase, restore, purchasing, status } = usePremium();
  
  useEffect(() => {
    track('paywall_shown');
  }, []);
  
  const handlePurchase = async (productId: 'remove_ads' | 'premium_decks' | 'premium_bundle') => {
    track('purchase_initiated', { productId });
    const success = await purchase(productId);
    if (success) {
      audioService.play('unlock');
      track('purchase_completed', { productId });
      toast.success('Purchase successful! 🎉');
      navigate('/');
    } else {
      toast.error('Purchase failed. Please try again.');
    }
  };
  
  const handleRestore = withAudio('tap', async () => {
    await restore();
    if (status.isActive) {
      audioService.play('unlock');
      toast.success('Purchases restored!');
      navigate('/');
    } else {
      toast.info('No purchases found to restore.');
    }
  });

  return (
    <PageLayout>
      <header className="flex items-center gap-4 p-4">
        <BackButton to="/" />
      </header>
      
      {/* Content */}
      <main className="flex-1 flex flex-col p-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
            className="inline-block"
          >
            <Crown className="w-16 h-16 text-secondary mx-auto mb-4" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-gradient-premium mb-2">
            Go Premium
          </h1>
          <p className="text-muted-foreground">
            Unlock the full WordRush experience
          </p>
        </motion.div>
        
        {/* Features */}
        <DelayedFadeIn delay={0.1} className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
            >
              <div className="w-10 h-10 rounded-full premium-gradient flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-foreground">{feature.text}</span>
              <Check className="w-5 h-5 text-success ml-auto" />
            </motion.div>
          ))}
        </DelayedFadeIn>
        
        {/* Products */}
        <div className="space-y-3 mb-6">
          {products.map((product, index) => {
            // Check if this product is already purchased
            const isPurchased = 
              (product.id === 'remove_ads' && status.hasRemoveAds) ||
              (product.id === 'premium_decks' && status.hasPremiumDecks) ||
              (product.id === 'premium_bundle' && status.hasRemoveAds && status.hasPremiumDecks);
            
            return (
              <DelayedFadeIn key={product.id} delay={0.4 + index * 0.1}>
                <Tappable>
                  <Button
                    onClick={withAudio('tap', () => handlePurchase(product.id))}
                    disabled={purchasing || isPurchased}
                    className={`w-full h-auto py-3 px-3 rounded-xl flex-col items-start gap-2 ${
                      product.id === 'premium_bundle' 
                        ? 'premium-gradient text-white border-0' 
                        : 'bg-card border border-border'
                    }`}
                    variant={product.id === 'premium_bundle' ? 'default' : 'outline'}
                  >
                    <div className="text-left w-full">
                      <div className="flex items-center justify-between w-full gap-2">
                        <p className="font-bold text-base">{product.name}</p>
                        <div className="flex items-center gap-2">
                          {isPurchased && (
                            <Check className="w-5 h-5 text-success" />
                          )}
                          <span className={`font-display text-lg font-bold shrink-0 ${
                            isPurchased ? 'text-success line-through' : product.id === 'premium_bundle' ? 'text-white' : 'text-foreground'
                          }`}>
                            {product.price}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs opacity-80 mt-1">{product.description}</p>
                    </div>
                  </Button>
                </Tappable>
                {product.id === 'premium_bundle' && (
                  <p className="text-center text-xs text-muted-foreground mt-1">
                    Best value - Save 25%
                  </p>
                )}
              </DelayedFadeIn>
            );
          })}
        </div>
        
        {/* Restore */}
        <Button
          variant="ghost"
          onClick={handleRestore}
          disabled={purchasing}
          className="text-muted-foreground"
        >
          Restore Purchases
        </Button>
      </main>
      
      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground">
        <p>One-time purchase. No subscription.</p>
      </footer>
    </PageLayout>
  );
}
