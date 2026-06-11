import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../../shared/theme/colors';
import { spacing, borderRadius } from '../../shared/theme/spacing';
import type { Word } from '../types';

interface WordCardProps {
  word: Word | null;
  deckIcon?: string;
  onCorrect?: () => void;
  onSkip?: () => void;
}

export function WordCard({ word, deckIcon, onCorrect, onSkip }: WordCardProps) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Adaptive sizes
  const cardHeight = isLandscape
    ? Math.max(height * 0.68, 180)
    : Math.min(height * 0.56, 520);
  const wordFontSize = isLandscape ? 34 : 54;
  const iconSize = isLandscape ? 22 : 30;

  const flipAnim = useRef(new Animated.Value(0)).current;
  const correctOpacity = useRef(new Animated.Value(0)).current;
  const skipOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!word) return;
    // Reset zone overlays
    correctOpacity.setValue(0);
    skipOpacity.setValue(0);
    // Flip in
    flipAnim.setValue(1);
    Animated.spring(flipAnim, {
      toValue: 0,
      tension: 90,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, [word?.id]);

  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const handleCorrect = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.timing(correctOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(correctOpacity, { toValue: 0.6, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      correctOpacity.setValue(0);
      onCorrect?.();
    });
  };

  const handleSkip = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Animated.sequence([
      Animated.timing(skipOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(skipOpacity, { toValue: 0.6, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      skipOpacity.setValue(0);
      onSkip?.();
    });
  };

  if (!word) return null;

  return (
    <Animated.View
      style={[
        styles.card,
        { height: cardHeight, transform: [{ perspective: 1200 }, { rotateY }] },
      ]}
    >
      {/* Card glass background */}
      <LinearGradient
        colors={['rgba(30,41,59,0.95)', 'rgba(15,23,42,0.98)']}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle border glow */}
      <View style={styles.borderGlow} />

      {/* ── Correct zone (top half) ─────────────────────────── */}
      <TouchableOpacity
        style={styles.zone}
        onPress={handleCorrect}
        activeOpacity={1}
      >
        {/* Persistent hint icon */}
        <View style={styles.hintContainer}>
          <Text style={[styles.hintIcon, { color: colors.success, fontSize: iconSize }]}>✓</Text>
          <Text style={[styles.hintLabel, { color: colors.success, fontSize: isLandscape ? 11 : 13 }]}>
            DOBRZE
          </Text>
        </View>

        {/* Flash overlay on tap */}
        <Animated.View
          style={[styles.zoneFlash, { opacity: correctOpacity }]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={['rgba(16,185,129,0.55)', 'rgba(16,185,129,0.15)']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* ── Skip zone (bottom half) ──────────────────────────── */}
      <TouchableOpacity
        style={styles.zone}
        onPress={handleSkip}
        activeOpacity={1}
      >
        {/* Persistent hint icon */}
        <View style={[styles.hintContainer, styles.hintBottom]}>
          <Text style={[styles.hintIcon, { color: colors.warning, fontSize: iconSize }]}>✕</Text>
          <Text style={[styles.hintLabel, { color: colors.warning, fontSize: isLandscape ? 11 : 13 }]}>
            PAS
          </Text>
        </View>

        {/* Flash overlay on tap */}
        <Animated.View
          style={[styles.zoneFlash, { opacity: skipOpacity }]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={['rgba(245,158,11,0.15)', 'rgba(245,158,11,0.55)']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* ── Word overlay (non-interactive) ───────────────────── */}
      <View style={styles.wordOverlay} pointerEvents="none">
        {deckIcon ? (
          <Text style={[styles.deckIcon, { fontSize: isLandscape ? 20 : 26 }]}>{deckIcon}</Text>
        ) : null}

        <Text
          style={[styles.wordText, { fontSize: wordFontSize }]}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
          numberOfLines={isLandscape ? 2 : 3}
        >
          {word.text}
        </Text>

        {word.category ? (
          <Text style={styles.category}>{word.category.toUpperCase()}</Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    // 3D depth shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
  },
  borderGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    zIndex: 10,
  },
  zone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  hintBottom: {
    top: undefined,
    bottom: spacing.md,
  },
  hintIcon: {
    fontWeight: '900',
    opacity: 0.5,
  },
  hintLabel: {
    fontWeight: '800',
    letterSpacing: 1.5,
    opacity: 0.5,
  },
  zoneFlash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: spacing.xl,
  },
  wordOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  deckIcon: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  wordText: {
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: undefined,
    // Subtle text shadow for depth
    textShadowColor: 'rgba(79,70,229,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  category: {
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 2.5,
    marginTop: spacing.md,
    fontWeight: '600',
  },
});
