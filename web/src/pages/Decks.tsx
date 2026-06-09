// Deck Selection Page
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { PageLayout } from '@/components/PageLayout';
import { DeckSection } from '@/components/DeckSection';
import { AnimatedListItem } from '@/components/AnimatedListItem';
import { DeckCard } from '@/components/game/DeckCard';
import { sampleDecks } from '@/game/decks';
import { usePremium } from '@/hooks/usePremium';
import { withAudio } from '@/lib/audio-helpers';
import { createRandomDeck } from '@/lib/deck-helpers';
import { audioService } from '@/services/audio';

export default function Decks() {
  const navigate = useNavigate();
  const { status, loading } = usePremium();
  const hasPremiumDecks = status.hasPremiumDecks;
  
  const navigateToPaywall = () => {
    window.scrollTo(0, 0);
    navigate('/paywall');
  };
  
  const handleSelectDeck = withAudio('select', (deck: typeof sampleDecks[0]) => {
    navigate(`/game/${deck.id}`);
  });
  
  const handleUnlockPremium = withAudio('tap', navigateToPaywall);
  
  const handleRandomFree = withAudio('select', () => {
    const randomDeck = freeDecks[Math.floor(Math.random() * freeDecks.length)];
    navigate(`/game/${randomDeck.id}`);
  });
  
  const handleRandomPremium = () => {
    if (!hasPremiumDecks) {
      audioService.play('tap');
      navigateToPaywall();
      return;
    }
    audioService.play('select');
    const randomDeck = premiumDecks[Math.floor(Math.random() * premiumDecks.length)];
    navigate(`/game/${randomDeck.id}`);
  };
  
  const freeDecks = sampleDecks.filter(d => !d.isPremium);
  const premiumDecks = sampleDecks.filter(d => d.isPremium);
  
  const randomFreeDeck = createRandomDeck('random-free', 'Random Free', '🎲', 'accent', false, freeDecks.length);
  const randomPremiumDeck = createRandomDeck('random-premium', 'Random Premium', '💎', 'secondary', true, premiumDecks.length);
  
  return (
    <PageLayout>
      <PageHeader title="Choose a Deck" backTo="/" />
      
      {/* Deck list */}
      <main className="flex-1 p-4 space-y-6">

        {/* Random selection */}
        <DeckSection title="Random Decks" delay={0.1}>
          <AnimatedListItem index={0} baseDelay={0.1}>
            <DeckCard deck={randomFreeDeck} onSelect={handleRandomFree} showWordCount={false} />
          </AnimatedListItem>
          
          <AnimatedListItem index={1} baseDelay={0.1}>
            <DeckCard
              deck={randomPremiumDeck}
              onSelect={handleRandomPremium}
              isLocked={!hasPremiumDecks}
              onUnlock={handleUnlockPremium}
              showWordCount={false}
            />
          </AnimatedListItem>
        </DeckSection>
        
        {/* Free decks */}
        <DeckSection title="Free Decks" delay={0.1}>
          {freeDecks.map((deck, index) => (
            <AnimatedListItem key={deck.id} index={index} baseDelay={0.3}>
              <DeckCard deck={deck} onSelect={handleSelectDeck} />
            </AnimatedListItem>
          ))}
        </DeckSection>
        
        {/* Premium decks */}
        <DeckSection title="Premium Decks" icon={<span className="-mt-1">👑</span>} delay={0.2}>
          {premiumDecks.map((deck, index) => (
            <AnimatedListItem key={deck.id} index={index} baseDelay={0.3 + freeDecks.length * 0.1}>
              <DeckCard
                deck={deck}
                onSelect={handleSelectDeck}
                isLocked={!hasPremiumDecks}
                onUnlock={handleUnlockPremium}
              />
            </AnimatedListItem>
          ))}
        </DeckSection>
      </main>
    </PageLayout>
  );
}
