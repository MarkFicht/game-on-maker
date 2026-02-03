// Helper to create random deck objects
import type { Deck } from '@/game/types';

export function createRandomDeck(
  id: string,
  name: string,
  icon: string,
  color: Deck['color'],
  isPremium: boolean,
  count: number
): Deck {
  return {
    id,
    name,
    description: `Pick a random deck from ${count} ${isPremium ? 'premium' : 'free'} options`,
    icon,
    color,
    isPremium,
    difficulty: 'easy',
    words: [],
  };
}
