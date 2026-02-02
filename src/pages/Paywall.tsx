// Paywall Page - Premium purchase screen
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Crown, Sparkles, Zap, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePremium } from '@/hooks/usePremium';
import { audioService } from '@/services/audio';
import { toast } from 'sonner';
import { track } from '@/services/analytics';
import { useEffect } from 'react';

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
    audioService.play('tap');
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
  
  const handleRestore = async () => {
    audioService.play('tap');
    await restore();
    if (status.isActive) {
      audioService.play('unlock');
      toast.success('Purchases restored!');
      navigate('/');
    } else {
      toast.info('No purchases found to restore.');
    }
  };
  
  const handleBack = () => {
    audioService.play('tap');
  };
  
  // If already premium, show success state
  if (status.hasRemoveAds && status.hasPremiumDecks) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background safe-top safe-bottom safe-x">
        <header className="flex items-center gap-4 p-4">
          <Link to="/" onClick={handleBack}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <Crown className="w-20 h-20 text-secondary mx-auto mb-4" />
          </motion.div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            You're Premium!
          </h2>
          <p className="text-muted-foreground mb-6">
            Thanks for supporting WordRush
          </p>
          <Button onClick={() => navigate('/')} className="btn-game text-primary-foreground">
            Continue Playing
          </Button>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background safe-top safe-bottom safe-x">
      {/* Header */}
      <header className="flex items-center gap-4 p-4">
        <Link to="/" onClick={handleBack}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 mb-8"
        >
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
        </motion.div>
        
        {/* Products */}
        <div className="space-y-3 mb-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Button
                onClick={() => handlePurchase(product.id)}
                disabled={purchasing}
                className={`w-full h-auto py-4 rounded-xl justify-between ${
                  product.id === 'premium_bundle' 
                    ? 'premium-gradient text-white border-0' 
                    : 'bg-card border border-border'
                }`}
                variant={product.id === 'premium_bundle' ? 'default' : 'outline'}
              >
                <div className="text-left">
                  <p className="font-bold">{product.name}</p>
                  <p className="text-sm opacity-80">{product.description}</p>
                </div>
                <span className="font-display text-xl font-bold">
                  {product.price}
                </span>
              </Button>
              {product.id === 'premium_bundle' && (
                <p className="text-center text-xs text-muted-foreground mt-1">
                  Best value - Save 25%
                </p>
              )}
            </motion.div>
          ))}
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
    </div>
  );
}
