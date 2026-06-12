import React, { useEffect, useRef, useMemo } from 'react';
import { makeEntranceAnim, startEntranceAll, entranceStyle, makeSwayAnim, startSway, swayInterpolate } from '../src/shared/animation/entrance';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { usePayments } from '../src/core/payments/usePayments';
import { GradientBackground, PageHeader, Button } from '../src/shared/components';
import { colors, spacing, borderRadius } from '../src/shared/theme';

const FEATURES = [
  { icon: '🚀', title: 'Brak reklam', sub: 'Graj bez przeszkód' },
  { icon: '✨', title: 'Premium talie', sub: 'Odblokuj wszystkie kategorie' },
  { icon: '❤️', title: 'Wspierasz twórcę', sub: 'Pomóż rozwijać WordRush' },
];

// 3D bevel package button
function PackageBtn({
  label,
  price,
  description,
  isBest,
  isPurchased,
  loading,
  onPress,
}: {
  label: string;
  price: string;
  description: string;
  isBest?: boolean;
  isPurchased?: boolean;
  loading?: boolean;
  onPress: () => void;
}) {
  // Best: full indigo tints. Others: subtle semi-transparent indigo glass edge.
  const bevelColors: readonly [string, string] = isBest
    ? ['#9590EF', '#2F2A89']
    : ['rgba(149,144,239,0.30)', 'rgba(47,42,137,0.30)'];

  const innerColors: readonly [string, string] = isPurchased
    ? ['#059669', '#065F46']
    : isBest
    ? ['#4F46E5', '#3730A3']
    : ['rgba(30,41,59,0.90)', 'rgba(20,28,48,0.90)'];

  return (
    <Pressable
      onPress={onPress}
      disabled={loading || isPurchased}
      style={({ pressed }) => ({ opacity: pressed ? 0.86 : 1 })}
    >
      <LinearGradient
        colors={bevelColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.pkgBevel, isBest && styles.pkgBevelBest]}
      >
        <LinearGradient
          colors={innerColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.pkgInner}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.16)']}
            locations={[0, 0.38, 0.62, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.pkgLeft}>
            <Text style={styles.pkgLabel}>{isPurchased ? `✓ ${label}` : label}</Text>
            <Text style={styles.pkgDesc}>{description}</Text>
          </View>
          <Text style={[styles.pkgPrice, isBest && styles.pkgPriceBest]}>
            {isPurchased ? 'Aktywny' : price}
          </Text>
        </LinearGradient>
      </LinearGradient>
    </Pressable>
  );
}

export default function StoreScreen() {
  const { isPremium, isLoading, offerings, fetchOfferings, purchase, restore, isPurchasing, isRestoring } =
    usePayments();

  const crownSway = useRef(makeSwayAnim()).current;
  const crownRotate = useMemo(() => swayInterpolate(crownSway), []);

  const anims = useMemo(() => [
    makeEntranceAnim(), // hero
    makeEntranceAnim(), // features
    makeEntranceAnim(), // packages
    makeEntranceAnim(), // restore
  ], []);

  useEffect(() => {
    fetchOfferings();
    startSway(crownSway);
    startEntranceAll(anims);
  }, []);

  // ── Already premium ────────────────────────────────────────────────
  if (!isLoading && isPremium) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safe}>
          <PageHeader title="Premium" showBack />
          <View style={styles.premiumState}>
            <Animated.Text style={[styles.crownEmoji, { transform: [{ rotate: crownRotate }] }]}>👑</Animated.Text>
            <Text style={styles.premiumTitle}>Masz Premium!</Text>
            <Text style={styles.premiumSub}>Dziękujemy za wsparcie WordRush 🎉</Text>
            <View style={styles.premiumActions}>
              <Button label="🎮  Zagraj" onPress={() => router.push('/decks')} size="lg" />
              <Button
                label="⭐  Oceń nas"
                onPress={() => {}}
                variant="outline"
                style={{ marginTop: spacing.sm }}
              />
            </View>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safe}>
          <PageHeader title="Sklep" showBack />
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  // ── Paywall ────────────────────────────────────────────────────────
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <PageHeader title="Go Premium" showBack />

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <Animated.View style={[styles.hero, entranceStyle(anims[0])]}>
            <View style={styles.heroCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.xl }]}
              />
              <Animated.Text style={[styles.crownEmoji, { transform: [{ rotate: crownRotate }] }]}>👑</Animated.Text>
              <Text style={styles.heroTitle}>Odblokuj Premium</Text>
              <Text style={styles.heroSub}>Pełne doświadczenie WordRush</Text>
            </View>
          </Animated.View>

          {/* Features */}
          <Animated.View style={[{ gap: 8 }, entranceStyle(anims[1])]}>
            {FEATURES.map((f, i) => (
              <View key={i} style={[styles.featureRow]}>
                <LinearGradient
                  colors={[colors.primary, '#7C3AED']}
                  style={styles.featureIconWrap}
                >
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                </LinearGradient>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureSub}>{f.sub}</Text>
                </View>
                <Text style={styles.featureCheck}>✓</Text>
              </View>
            ))}
          </Animated.View>

          {/* Packages */}
          <Animated.View style={[{ gap: 8 }, entranceStyle(anims[2])]}>
            {offerings?.availablePackages.length ? (
              offerings.availablePackages.map((pkg, i) => (
                <PackageBtn
                  key={pkg.identifier}
                  label={pkg.product.title}
                  price={pkg.product.priceString}
                  description={pkg.product.description}
                  isBest={i === offerings.availablePackages.length - 1}
                  isPurchased={false}
                  loading={isPurchasing}
                  onPress={() => purchase(pkg)}
                />
              ))
            ) : (
              <View style={styles.noOfferings}>
                <Text style={styles.noOfferingsText}>
                  Brak dostępnych ofert.{'\n'}Sprawdź połączenie z internetem.
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Restore */}
          <Animated.View style={entranceStyle(anims[3])}>
          <Button
            label={isRestoring ? 'Przywracanie…' : 'Przywróć zakupy'}
            onPress={restore}
            variant="primary"
            loading={isRestoring}
            style={styles.restoreBtn}
          />

          </Animated.View>

          {/* Footer */}
          <Text style={styles.footer}>⚡ Jednorazowy zakup. Bez subskrypcji.</Text>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },

  // Premium state (already purchased)
  premiumState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  premiumTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: -0.5,
  },
  premiumSub: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  premiumActions: {
    width: '100%',
    marginTop: spacing.lg,
  },

  // Hero
  hero: {
    alignItems: 'stretch',
  },
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(30,41,59,0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  crownEmoji: {
    fontSize: 56,
    textShadowColor: 'rgba(245,158,11,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Features
  features: {
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(30,41,59,0.70)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: { fontSize: 18 },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  featureSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  featureCheck: {
    fontSize: 16,
    color: colors.success,
    fontWeight: '700',
  },

  // Package buttons
  packages: {
    gap: spacing.sm,
  },
  pkgBevel: {
    borderRadius: borderRadius.lg,
    padding: 3,
  },
  pkgBevelBest: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 10,
  },
  pkgInner: {
    borderRadius: borderRadius.lg - 3,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pkgLeft: { flex: 1 },
  pkgLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  pkgDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  pkgPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  pkgPriceBest: {
    color: '#F59E0B',
  },

  noOfferings: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(30,41,59,0.70)',
    borderRadius: borderRadius.lg,
  },
  noOfferingsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  restoreBtn: {
    alignSelf: 'center',
    minWidth: 220,
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.white,
    marginTop: spacing.xs,
  },
});
