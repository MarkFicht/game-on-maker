import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Asset } from 'expo-asset';
import { makeEntranceAnim, startEntranceAll, entranceStyle } from '../src/shared/animation/entrance';
import { router } from '../src/shared/navigation';
import { DeckCard } from '../src/game/components';
import { getFreeDecks, getPremiumDecks, sampleDecks } from '../src/game/decks';
import { usePaymentsContext } from '../src/core/payments/PaymentsProvider';
import { GradientBackground, useHeaderConfig, HEADER_BAR_HEIGHT } from '../src/shared/components';
import { colors, spacing, borderRadius } from '../src/shared/theme';
import type { Deck } from '../src/game/types';

const PREMIUM_BANNER_IMG = require('../assets/gradients/decks_premium_banner.png');
const IMAGE_FILL = { position: 'absolute', top: -1, left: -1, right: -1, bottom: -1 } as const;
const RANDOM_DECK_IMGS = [require('../assets/decks/random.png'), require('../assets/decks/random_premium.png')];

// Self-contained: this card's own useFocusEffect is the *only* trigger for
// its entrance, for both the very first mount (push/back never remounts an
// already-mounted screen, so a mount-only effect never replayed on
// refocus) and every later refocus — one mechanism, so both cases produce
// the exact same animation with no parent coordination (no replay prop,
// no key bump) needed.
function SlideCard({ delay, children }: { delay: number; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-55)).current;
  // expo-router's unstable useNavigation() (see app/settings.tsx) can fire
  // this twice for one logical focus, in immediate succession — debounced.
  const lastFocusRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastFocusRef.current < 200) return;
      lastFocusRef.current = now;
      opacity.setValue(0);
      translateX.setValue(-55);
      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(delay + 100),
          Animated.spring(translateX, { toValue: 0, tension: 50, friction: 5, useNativeDriver: true }),
        ]),
      ]).start();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

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
  console.log('[PERF] DecksScreen render', Date.now());
  const { isPremium } = usePaymentsContext();
  useHeaderConfig({ title: 'Wybierz talię', showBack: true });

  const freeDecks = getFreeDecks();
  const premiumDecks = getPremiumDecks();

  // TEMP PERF: see app/settings.tsx for the same pattern.
  const layoutCounts = useRef<Record<string, number>>({});
  const logLayout = (label: string) => (e: { nativeEvent: { layout: { y: number; height: number } } }) => {
    const n = (layoutCounts.current[label] ?? 0) + 1;
    layoutCounts.current[label] = n;
    const { y, height } = e.nativeEvent.layout;
    console.log(`[PERF] layout #${n} "${label}" y=${y} h=${height}`, Date.now());
  };

  const anims = useMemo(() => [
    makeEntranceAnim(), // random section
    makeEntranceAnim(), // free section
    makeEntranceAnim(), // premium section
  ], []);

  // Pre-decode every deck image while the user is still browsing this list
  // (they're already shown here, just smaller) — game.tsx's "ready" screen
  // waits for its own larger Image's onLoad before animating in, so having
  // it already decoded/cached by then avoids that wait almost entirely.
  // Fire-and-forget: no loading state needed, this is purely a head start.
  useEffect(() => {
    Promise.all(
      [...sampleDecks.map(d => d.image), ...RANDOM_DECK_IMGS]
        .filter(Boolean)
        .map(img => Asset.fromModule(img).downloadAsync()),
    ).catch(() => {});
  }, []);

  // useFocusEffect (not useEffect) — router.back() refocuses this screen
  // without remounting it (push keeps it mounted), so a plain useEffect
  // with [] deps only ever ran once, on the very first visit. Replays just
  // the section-level fade+slide on every focus — see SlideCard above for
  // why per-card replay isn't worth it.
  //
  // expo-router's unstable useNavigation() (see app/settings.tsx) can tear
  // down and recreate this whole effect twice for one logical focus, in
  // immediate succession — debounced below.
  const lastFocusRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastFocusRef.current < 200) return;
      lastFocusRef.current = now;
      startEntranceAll(anims, 90);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

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
        <View style={{ height: HEADER_BAR_HEIGHT }} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Random */}
          <Animated.View style={entranceStyle(anims[0])} onLayout={logLayout('Random')}>
          <SectionTitle icon="🎲">Losowe talie</SectionTitle>
          <SlideCard delay={0}>
          <DeckCard
            deck={{
              id: 'random-free',
              name: 'Losowa darmowa',
              description: `Losuj spośród ${freeDecks.length} darmowych talii`,
              icon: '🎲',
              image: require('../assets/decks/random.png'),
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
              image: require('../assets/decks/random_premium.png'),
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
          <Animated.View style={entranceStyle(anims[1])} onLayout={logLayout('Free')}>
          <SectionTitle icon="🆓">Darmowe talie</SectionTitle>
          {freeDecks.map((deck, i) => (
            <SlideCard key={deck.id} delay={90 + i * 130}>
              <DeckCard deck={deck} onSelect={handleSelect} />
            </SlideCard>
          ))}

          </Animated.View>

          <View style={styles.separator} />

          {/* Premium */}
          <Animated.View style={entranceStyle(anims[2])} onLayout={logLayout('Premium')}>
          <View style={styles.premiumHeader}>
            <SectionTitle icon="👑">Talie premium</SectionTitle>
            {!isPremium && (
              <Text style={styles.unlockHint}>Odblokuj wszystkie</Text>
            )}
          </View>
          {premiumDecks.map((deck, i) => (
            <SlideCard key={deck.id} delay={180 + i * 140}>
              <DeckCard
                deck={deck}
                onSelect={handleSelect}
                isLocked={!isPremium}
                onUnlock={handleUnlock}
              />
            </SlideCard>
          ))}

          {!isPremium && (
            <View style={styles.premiumBanner}>
              <Image source={PREMIUM_BANNER_IMG} resizeMode="stretch" style={IMAGE_FILL} />
              <Text style={styles.bannerEmoji}>👑</Text>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Odblokuj Premium</Text>
                <Text style={styles.bannerSub}>Dostęp do wszystkich {premiumDecks.length} talii premium</Text>
              </View>
            </View>
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
    overflow: 'hidden',
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
