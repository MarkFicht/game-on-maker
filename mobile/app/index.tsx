import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground, PageHeader } from '../src/shared/components';
import { usePaymentsContext } from '../src/core/payments/PaymentsProvider';
import { colors, spacing, borderRadius } from '../src/shared/theme';

export default function HomeScreen() {
  const { isPremium } = usePaymentsContext();

  const emojiScale  = useRef(new Animated.Value(0)).current;
  const emojiRotate = useRef(new Animated.Value(-0.3)).current;
  const fadeUp1     = useRef(new Animated.Value(0)).current;
  const slideUp1    = useRef(new Animated.Value(20)).current;
  const fadeUp2     = useRef(new Animated.Value(0)).current;
  const slideUp2    = useRef(new Animated.Value(20)).current;
  const playPulse   = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.5)).current;

  // Re-run entrance animation every time the home screen comes into focus
  useFocusEffect(
    useCallback(() => {
      emojiScale.setValue(0);
      emojiRotate.setValue(-0.3);
      fadeUp1.setValue(0);
      slideUp1.setValue(20);
      fadeUp2.setValue(0);
      slideUp2.setValue(20);
      playPulse.setValue(1);
      glowOpacity.setValue(0.5);

      // Emoji and title appear together — no staggered wait
      const entrance = Animated.parallel([
        Animated.spring(emojiScale,  { toValue: 1, tension: 120, friction: 7, useNativeDriver: true }),
        Animated.spring(emojiRotate, { toValue: 0, tension: 120, friction: 7, useNativeDriver: true }),
        Animated.timing(fadeUp1,  { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideUp1, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeUp2,  { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(slideUp2, { toValue: 0, duration: 380, useNativeDriver: true }),
      ]);

      let pulseLoop: Animated.CompositeAnimation | null = null;

      entrance.start(() => {
        pulseLoop = Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(playPulse,   { toValue: 1.04, duration: 1100, useNativeDriver: true }),
              Animated.timing(glowOpacity, { toValue: 1.0,  duration: 1100, useNativeDriver: true }),
            ]),
            Animated.parallel([
              Animated.timing(playPulse,   { toValue: 1,    duration: 1100, useNativeDriver: true }),
              Animated.timing(glowOpacity, { toValue: 0.5,  duration: 1100, useNativeDriver: true }),
            ]),
          ]),
        );
        pulseLoop.start();
      });

      return () => {
        entrance.stop();
        pulseLoop?.stop();
      };
    }, [])
  );

  const rotate = emojiRotate.interpolate({ inputRange: [-1, 1], outputRange: ['-18deg', '18deg'] });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>

        {/* Universal transparent header */}
        <PageHeader title="WordRush" isHome />

        {/* Main content */}
        <View style={styles.main}>

          {/* Emoji + glow */}
          <View style={styles.emojiSection}>
            <View style={styles.emojiWrapper}>
              {/*
                Small glow behind the icon — smaller than emoji so the hard edge
                is hidden under the icon itself. Shadow does the soft fade outward.
              */}
              <Animated.View style={[styles.emojiGlow, { opacity: glowOpacity }]} />
              <Animated.Text
                style={[styles.emoji, { transform: [{ scale: emojiScale }, { rotate }] }]}
              >
                🎯
              </Animated.Text>
            </View>

            <Animated.View
              style={[styles.titleBlock, { opacity: fadeUp1, transform: [{ translateY: slideUp1 }] }]}
            >
              <Text style={styles.title}>WordRush</Text>
              <Text style={styles.subtitle}>Odgadnij słowo zanim skończy się czas!</Text>
            </Animated.View>
          </View>

          {/* Buttons */}
          <Animated.View
            style={[styles.actions, { opacity: fadeUp2, transform: [{ translateY: slideUp2 }] }]}
          >
            {/*
              Play button — 3-layer 3D:
              1. Bevel (white-top → black-bottom, 3 px chrome edge)
              2. Orange gradient (solid button color)
              3. Depth overlay (smooth convex effect)
            */}
            <Animated.View style={{ transform: [{ scale: playPulse }] }}>
              <Pressable
                onPress={() => router.push('/decks')}
                style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.42)', 'rgba(0,0,0,0.46)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.playBevel}
                >
                  <LinearGradient
                    colors={['#F97316', '#E8650A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.playInner}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.26)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.18)']}
                      locations={[0, 0.38, 0.62, 1]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={StyleSheet.absoluteFill}
                      pointerEvents="none"
                    />
                    <Text style={styles.playText}>🎮  Zagraj</Text>
                  </LinearGradient>
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Premium button — solid, fully opaque */}
            <Pressable
              onPress={() => router.push('/store')}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.32)', 'rgba(0,0,0,0.30)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.premBevel}
              >
                <LinearGradient
                  colors={isPremium ? ['#059669', '#065F46'] : ['#4F46E5', '#3730A3']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.premInner}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.16)']}
                    locations={[0, 0.38, 0.62, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />
                  <Text style={styles.premText}>
                    {isPremium ? '👑  Masz Premium' : '👑  Zdobądź Premium'}
                  </Text>
                </LinearGradient>
              </LinearGradient>
            </Pressable>

          </Animated.View>
        </View>

        <Text style={styles.footer}>Gra imprezowa dla znajomych ⚡</Text>

      </SafeAreaView>
    </GradientBackground>
  );
}

// ── Geometry ─────────────────────────────────────────────────────────────────
const WRAPPER   = 148;
const GLOW_SIZE = 68;                           // smaller → hard edge hidden under emoji
const GLOW_POS  = (WRAPPER - GLOW_SIZE) / 2;   // 40 — centered
const GLOW_Y    = GLOW_POS + 6;                 // shift 6 px down: "under" the icon

const styles = StyleSheet.create({
  safe: { flex: 1 },

  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },

  emojiSection: {
    alignItems: 'center',
    gap: spacing.md,
  },
  emojiWrapper: {
    width: WRAPPER,
    height: WRAPPER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiGlow: {
    position: 'absolute',
    top: GLOW_Y,
    left: GLOW_POS,
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
    backgroundColor: 'rgba(249,115,22,0.10)',  // very faint — shadow does the work
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.90,
    shadowRadius: 24,
    elevation: 0,
  },
  emoji: {
    fontSize: 90,
    lineHeight: 100,
    textShadowColor: 'rgba(249,115,22,0.60)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  titleBlock: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: 46,
    fontWeight: '800',
    color: '#F97316',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(249,115,22,0.40)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  actions: {
    width: '100%',
    gap: spacing.sm,
  },

  // Play button
  playBevel: {
    borderRadius: borderRadius.xl,
    padding: 3,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 18,
    elevation: 12,
  },
  playInner: {
    borderRadius: borderRadius.xl - 3,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  playText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.3,
  },

  // Premium button — solid opaque colors
  premBevel: {
    borderRadius: borderRadius.lg,
    padding: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.50,
    shadowRadius: 12,
    elevation: 8,
  },
  premInner: {
    borderRadius: borderRadius.lg - 2,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  premText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },

  footer: {
    textAlign: 'center',
    paddingBottom: spacing.lg,
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
  },
});
