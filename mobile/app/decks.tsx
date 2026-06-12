import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { makeEntranceAnim, startEntranceAll, entranceStyle } from '../src/shared/animation/entrance';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { DeckCard } from '../src/game/components';
import { getFreeDecks, getPremiumDecks } from '../src/game/decks';
import { usePaymentsContext } from '../src/core/payments/PaymentsProvider';
import { GradientBackground, PageHeader } from '../src/shared/components';
import { colors, spacing, borderRadius } from '../src/shared/theme';
import type { Deck } from '../src/game/types';

function SlideCard({ delay, children }: { delay: number; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(delay),
        Animated.spring(translateX, { toValue: 0, tension: 80, friction: 7, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      {children}
    </Animated.View>
  );
}

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

  const anims = useMemo(() => [
    makeEntranceAnim(), // random section
    makeEntranceAnim(), // free section
    makeEntranceAnim(), // premium section
  ], []);

  useEffect(() => { startEntranceAll(anims, 90); }, []);

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
          <Animated.View style={entranceStyle(anims[0])}>
          <SectionTitle icon="🎲">Losowe talie</SectionTitle>
          <SlideCard delay={0}>
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
          </SlideCard>
          <SlideCard delay={100}>
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
          </SlideCard>

          </Animated.View>

          <View style={styles.separator} />

          {/* Free */}
          <Animated.View style={entranceStyle(anims[1])}>
          <SectionTitle icon="🆓">Darmowe talie</SectionTitle>
          {freeDecks.map((deck, i) => (
            <SlideCard key={deck.id} delay={90 + i * 100}>
              <DeckCard deck={deck} onSelect={handleSelect} />
            </SlideCard>
          ))}

          </Animated.View>

          <View style={styles.separator} />

          {/* Premium */}
          <Animated.View style={entranceStyle(anims[2])}>
          <View style={styles.premiumHeader}>
            <SectionTitle icon="👑">Talie premium</SectionTitle>
            {!isPremium && (
              <Text style={styles.unlockHint}>Odblokuj wszystkie</Text>
            )}
          </View>
          {premiumDecks.map((deck, i) => (
            <SlideCard key={deck.id} delay={180 + i * 100}>
              <DeckCard
                deck={deck}
                onSelect={handleSelect}
                isLocked={!isPremium}
                onUnlock={handleUnlock}
              />
            </SlideCard>
          ))}

          {!isPremium && (
            <LinearGradient
              colors={['rgba(67,56,202,0.60)', 'rgba(49,46,129,0.50)']}
              style={styles.premiumBanner}
            >
              <Text style={styles.bannerEmoji}>👑</Text>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Odblokuj Premium</Text>
                <Text style={styles.bannerSub}>Dostęp do wszystkich {premiumDecks.length} talii premium</Text>
              </View>
            </LinearGradient>
          )}

          </Animated.View>

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
    borderColor: 'rgba(129,120,255,0.40)',
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
    color: colors.text,
    marginTop: 2,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: spacing.md,
  },
});
