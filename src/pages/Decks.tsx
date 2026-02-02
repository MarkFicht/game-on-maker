// Deck Selection Page
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Lock, Shuffle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SoundToggle } from '@/components/SoundToggle';
import { DeckCard } from '@/components/game/DeckCard';
import { sampleDecks } from '@/game/decks';
import { usePremium } from '@/hooks/usePremium';
import { audioService } from '@/services/audio';

export default function Decks() {
  const navigate = useNavigate();
  const { status, loading } = usePremium();
  const hasPremiumDecks = status.hasPremiumDecks;
  
  const handleSelectDeck = (deck: typeof sampleDecks[0]) => {
    audioService.play('select');
    navigate(`/game/${deck.id}`);
  };
  
  const handleUnlockPremium = () => {
    audioService.play('tap');
    navigate('/paywall');
  };
  
  const handleRandomFree = () => {
    audioService.play('select');
    const randomDeck = freeDecks[Math.floor(Math.random() * freeDecks.length)];
    navigate(`/game/${randomDeck.id}`);
  };
  
  const handleRandomPremium = () => {
    if (!hasPremiumDecks) {
      handleUnlockPremium();
      return;
    }
    audioService.play('select');
    const randomDeck = premiumDecks[Math.floor(Math.random() * premiumDecks.length)];
    navigate(`/game/${randomDeck.id}`);
  };
  
  const handleBack = () => {
    audioService.play('tap');
  };
  
  const freeDecks = sampleDecks.filter(d => !d.isPremium);
  const premiumDecks = sampleDecks.filter(d => d.isPremium);
  
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background safe-top safe-bottom safe-x">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border/50">
        <Link to="/" onClick={handleBack}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-display text-xl font-bold text-foreground">
          Choose a Deck
        </h1>
        <SoundToggle />
      </header>
      
      {/* Deck list */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* Random selection */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Random Decks
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={handleRandomFree}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="game-card p-4 text-center transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-accent opacity-10" />
              <div className="relative">
                <span className="text-4xl mb-2 block">🎲</span>
                <p className="font-display text-sm font-bold text-foreground">Random Free</p>
                <p className="text-xs text-muted-foreground mt-1">{freeDecks.length} decks</p>
              </div>
            </motion.button>
            
            <motion.button
              onClick={handleRandomPremium}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="game-card p-4 text-center transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-secondary opacity-10" />
              <div className="relative">
                <span className="text-4xl mb-2 block">💎</span>
                <div className="flex items-center justify-center gap-1.5">
                  <p className="font-display text-sm font-bold text-foreground leading-none">Random Premium</p>
                  {!hasPremiumDecks && !loading && (
                    <Lock className="w-3.5 h-3.5 text-secondary shrink-0 -mt-[2.5px]" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{premiumDecks.length} decks</p>
              </div>
              {!loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full premium-gradient text-white z-10"
                >
                  PRO
                </motion.div>
              )}
            </motion.button>
          </div>
        </motion.section>
        
        {/* Free decks */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Free Decks
          </h2>
          <div className="space-y-3">
            {freeDecks.map((deck, index) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <DeckCard
                  deck={deck}
                  onSelect={handleSelectDeck}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
        
        {/* Premium decks */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-secondary" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Premium Decks
            </h2>
          </div>
          <div className="space-y-3">
            {premiumDecks.map((deck, index) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <DeckCard
                  deck={deck}
                  onSelect={handleSelectDeck}
                  isLocked={!hasPremiumDecks}
                  onUnlock={handleUnlockPremium}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
