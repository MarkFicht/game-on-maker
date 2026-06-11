import React, { useEffect, useRef } from 'react';
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
  { icon: '🛡', title: 'Wspierasz twórcę', sub: 'Pomóż rozwijać WordRush' },
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
  const bevelColors: readonly [string, string] = isBest
    ? ['rgba(255,255,255,0.50)', 'rgba(0,0,0,0.40)']
    : ['rgba(255,255,255,0.24)', 'rgba(0,0,0,0.22)'];

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

  const crownRotate = useRef(new Animated.Value(-10)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchOfferings();
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(crownRotate, { toValue: 10,  duration: 1800, useNativeDriver: true }),
          Animated.timing(crownRotate, { toValue: -10, duration: 1800, useNativeDriver: true }),
        ]),
      ),
      Animated.timing(fade, { toValue: 1, duration: 380, useNativeDriver: true }),
    ]).start();
  }, []);

  const rotate = crownRotate.interpolate({ inputRange: [-10, 10], outputRange: ['-10deg', '10deg'] });

  // ── Already premium ────────────────────────────────────────────────
  if (!isLoading && isPremium) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safe}>
          <PageHeader title="Premium" showBack />
          <View style={styles.premiumState}>
            <Animated.Text style={[styles.crownEmoji, { transform: [{ rotate }] }]}>👑</Animated.Text>
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
          <Animated.View style={[styles.hero, { opacity: fade }]}>
            <View style={styles.heroCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.xl }]}
              />
              <Animated.Text style={[styles.crownEmoji, { transform: [{ rotate }] }]}>👑</Animated.Text>
              <Text style={styles.heroTitle}>Odblokuj Premium</Text>
              <Text style={styles.heroSub}>Pełne doświadczenie WordRush</Text>
            </View>
          </Animated.View>

          {/* Features */}
          <View style={styles.features}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
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
          </View>

          {/* Packages */}
          <View style={styles.packages}>
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
          </View>

          {/* Restore */}
          <Button
            label={isRestoring ? 'Przywracanie…' : '↺  Przywróć zakupy'}
            onPress={restore}
            variant="outline"
            loading={isRestoring}
            style={styles.restoreBtn}
          />

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
    padding: 2,
  },
  pkgBevelBest: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  pkgInner: {
    borderRadius: borderRadius.lg - 2,
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
    color: 'rgba(255,255,255,0.60)',
    marginTop: spacing.xs,
  },
});
