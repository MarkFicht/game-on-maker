// Deck Selection Page
import { motion } from 'framer-motion';
import { ArrowLeft, Crown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SoundToggle } from '@/components/SoundToggle';
import { DeckCard } from '@/components/game/DeckCard';
import { sampleDecks } from '@/game/decks';
import { useHasPremiumDecks } from '@/hooks/usePremium';
import { audioService } from '@/services/audio';

export default function Decks() {
  const navigate = useNavigate();
  const hasPremiumDecks = useHasPremiumDecks();
  
  const handleSelectDeck = (deck: typeof sampleDecks[0]) => {
    audioService.play('tap');
    navigate(`/game/${deck.id}`);
  };
  
  const handleUnlockPremium = () => {
    audioService.play('tap');
    navigate('/paywall');
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
        {/* Free decks */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
          transition={{ delay: 0.3 }}
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
                transition={{ delay: 0.4 + index * 0.1 }}
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
