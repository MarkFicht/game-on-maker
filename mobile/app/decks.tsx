import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { DeckCard } from '../src/game/components';
import { getFreeDecks, getPremiumDecks } from '../src/game/decks';
import { usePaymentsContext } from '../src/core/payments/PaymentsProvider';
import { GradientBackground, PageHeader } from '../src/shared/components';
import { colors, spacing, borderRadius } from '../src/shared/theme';
import type { Deck } from '../src/game/types';

function SectionTitle({ children, icon }: { children: string; icon?: string }) {
  return (
    <View style={styles.sectionRow}>
      {icon ? <Text style={styles.sectionIcon}>{icon}</Text> : null}
      <Text style={styles.sectionTitle}>{children}</Text>
    </View>
  );
}

export default function DecksScreen() {
  const { isPremium } = usePaymentsContext();

  const freeDecks = getFreeDecks();
  const premiumDecks = getPremiumDecks();

  const handleSelect = (deck: Deck) => {
    router.push({ pathname: '/game', params: { deckId: deck.id } });
  };

  const handleUnlock = () => {
    router.push('/store');
  };

  const handleRandomFree = () => {
    const deck = freeDecks[Math.floor(Math.random() * freeDecks.length)];
    router.push({ pathname: '/game', params: { deckId: deck.id } });
  };

  const handleRandomPremium = () => {
    if (!isPremium) {
      router.push('/store');
      return;
    }
    const deck = premiumDecks[Math.floor(Math.random() * premiumDecks.length)];
    router.push({ pathname: '/game', params: { deckId: deck.id } });
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <PageHeader title="Wybierz talię" showBack />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Random */}
          <SectionTitle icon="🎲">Losowe talie</SectionTitle>
          <DeckCard
            deck={{
              id: 'random-free',
              name: 'Losowa darmowa',
              description: `Losuj spośród ${freeDecks.length} darmowych talii`,
              icon: '🎲',
              color: colors.secondary,
              isPremium: false,
              words: [],
            }}
            onSelect={handleRandomFree}
            showWordCount={false}
          />
          <DeckCard
            deck={{
              id: 'random-premium',
              name: 'Losowa premium',
              description: `Losuj spośród ${premiumDecks.length} talii premium`,
              icon: '💎',
              color: colors.primary,
              isPremium: true,
              words: [],
            }}
            onSelect={handleRandomPremium}
            isLocked={!isPremium}
            onUnlock={handleUnlock}
            showWordCount={false}
          />

          <View style={styles.separator} />

          {/* Free */}
          <SectionTitle icon="🆓">Darmowe talie</SectionTitle>
          {freeDecks.map(deck => (
            <DeckCard key={deck.id} deck={deck} onSelect={handleSelect} />
          ))}

          <View style={styles.separator} />

          {/* Premium */}
          <View style={styles.premiumHeader}>
            <SectionTitle icon="👑">Talie premium</SectionTitle>
            {!isPremium && (
              <Text style={styles.unlockHint}>Odblokuj wszystkie</Text>
            )}
          </View>
          {premiumDecks.map(deck => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onSelect={handleSelect}
              isLocked={!isPremium}
              onUnlock={handleUnlock}
            />
          ))}

          {!isPremium && (
            <LinearGradient
              colors={['rgba(79,70,229,0.12)', 'rgba(79,70,229,0.04)']}
              style={styles.premiumBanner}
            >
              <Text style={styles.bannerEmoji}>👑</Text>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Odblokuj Premium</Text>
                <Text style={styles.bannerSub}>Dostęp do wszystkich {premiumDecks.length} talii premium</Text>
              </View>
            </LinearGradient>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: spacing.md,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIcon: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: spacing.md,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unlockHint: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.25)',
  },
  bannerEmoji: {
    fontSize: 28,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  bannerSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
