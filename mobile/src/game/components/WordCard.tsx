import { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import { colors } from '../../shared/theme/colors';
import { borderRadius, spacing } from '../../shared/theme/spacing';
import type { Word } from '../types';

interface WordCardProps {
  word: Word | null;
  deckImage?: number;
  onCorrect?: () => void;
  onSkip?: () => void;
  onAnswerSound?: (type: 'correct' | 'skip') => void;
  fullscreen?: boolean;
  vibrationEnabled?: boolean;
}

export function WordCard({
  word,
  deckImage,
  onCorrect,
  onSkip,
  onAnswerSound,
  fullscreen,
  vibrationEnabled = true,
}: WordCardProps) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const cardHeight = isLandscape
    ? Math.max(height * 0.68, 180)
    : Math.min(height * 0.56, 520);
  const wordFontSize = isLandscape ? 34 : 54;
  const iconSize = isLandscape ? 22 : 30;

  const flipAnim = useRef(new Animated.Value(1)).current;
  const correctFlash = useRef(new Animated.Value(0)).current;
  const skipFlash = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const accelReady = useRef(false);
  const cardLayoutHeight = useRef(0);

  // Stable ref to latest props — avoids stale closures in callbacks
  const propsRef = useRef({ onCorrect, onSkip, onAnswerSound, vibrationEnabled });
  propsRef.current = { onCorrect, onSkip, onAnswerSound, vibrationEnabled };

  // Word appearance: spring in from edge (suppressed during our own flip)
  useEffect(() => {
    if (!word || isAnimating.current) return;
    correctFlash.setValue(0);
    skipFlash.setValue(0);
    flipAnim.setValue(1);
    Animated.spring(flipAnim, {
      toValue: 0,
      tension: 90,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, [word?.id]);

  // Full answer sequence: flash card → flip out → swap word → flip in
  const triggerAnswer = useCallback((type: 'correct' | 'skip') => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const { onCorrect, onSkip, onAnswerSound, vibrationEnabled: vib } = propsRef.current;
    const flashAnim = type === 'correct' ? correctFlash : skipFlash;

    onAnswerSound?.(type);

    if (vib) {
      Haptics.notificationAsync(
        type === 'correct'
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning,
      );
    }

    // Flash peaks fast then fades — done exactly when card reaches 90° (t=180ms)
    // so the new word flips in on a clean black card
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 60,  useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
    ]).start();

    // Flip out to 90° in 180ms → swap word → spring back with new word on black card
    Animated.timing(flipAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start(() => {
      if (type === 'correct') onCorrect?.();
      else onSkip?.();

      flipAnim.setValue(-1);

      // Card is at -90° (invisible) — wait one frame for React to render the new word
      // before starting flip-in, otherwise the old word flickers on the first frames
      setTimeout(() => {
        Animated.spring(flipAnim, { toValue: 0, tension: 90, friction: 9, useNativeDriver: true }).start(() => {
          isAnimating.current = false;
        });
      }, 16);
    });
  }, []);

  // Accelerometer tilt: z < -0.65 = top tilted up → correct | z > 0.65 = top tilted down → skip
  // y < -0.3 guard ensures phone is roughly upright, not lying flat
  useEffect(() => {
    const readyTimer = setTimeout(() => { accelReady.current = true; }, 600);
    Accelerometer.setUpdateInterval(100);
    let subscription: ReturnType<typeof Accelerometer.addListener> | null = null;
    try {
      subscription = Accelerometer.addListener(({ y, z }) => {
        if (!accelReady.current || isAnimating.current) return;
        if (y < -0.3) {
          if (z < -0.65) triggerAnswer('correct');
          else if (z > 0.65) triggerAnswer('skip');
        }
      });
    } catch {
      // Accelerometer unavailable (simulator, web)
    }
    return () => {
      clearTimeout(readyTimer);
      subscription?.remove();
      accelReady.current = false;
    };
  }, [triggerAnswer]);

  const rotateY = flipAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-90deg', '0deg', '90deg'],
  });

  if (!word) return null;

  const cardSizeStyle: ViewStyle = fullscreen ? { flex: 1 } : { height: cardHeight };

  return (
    <Animated.View
      style={[
        styles.card,
        cardSizeStyle,
        { transform: [{ perspective: 1200 }, { rotateY }] },
      ]}
      // Single responder on the whole card — works on web, native, and simulator
      // locationY determines top (correct) vs bottom (skip) half
      onLayout={(e) => { cardLayoutHeight.current = e.nativeEvent.layout.height; }}
      onStartShouldSetResponder={() => !isAnimating.current}
      onResponderRelease={(e) => {
        const { locationY } = e.nativeEvent;
        triggerAnswer(locationY < cardLayoutHeight.current / 2 ? 'correct' : 'skip');
      }}
    >
      {/* Card glass background */}
      <LinearGradient
        colors={['rgba(30,41,59,0.95)', 'rgba(15,23,42,0.98)']}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle border glow */}
      <View style={styles.borderGlow} />

      {/* Full-card color flashes */}
      <Animated.View style={[styles.fullFlash, { opacity: correctFlash }]} pointerEvents="none">
        <LinearGradient
          colors={['rgba(16,185,129,0.60)', 'rgba(16,185,129,0.25)']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={[styles.fullFlash, { opacity: skipFlash }]} pointerEvents="none">
        <LinearGradient
          colors={['rgba(245,158,11,0.55)', 'rgba(239,68,68,0.30)']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Top half — visual area for CORRECT zone */}
      <View style={styles.half} pointerEvents="none">
        <View style={styles.hintTop}>
          <Text style={[styles.hintIcon, { color: colors.success, fontSize: iconSize }]}>✓</Text>
          <Text style={[styles.hintLabel, { color: colors.success, fontSize: isLandscape ? 11 : 13 }]}>
            DOBRZE
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} pointerEvents="none" />

      {/* Bottom half — visual area for SKIP zone */}
      <View style={styles.half} pointerEvents="none">
        <View style={styles.hintBottom}>
          <Text style={[styles.hintIcon, { color: colors.warning, fontSize: iconSize }]}>✕</Text>
          <Text style={[styles.hintLabel, { color: colors.warning, fontSize: isLandscape ? 11 : 13 }]}>
            PAS
          </Text>
        </View>
      </View>

      {/* Word + deck icon overlay */}
      <View style={styles.wordOverlay} pointerEvents="none">
        {deckImage ? (
          <Image source={deckImage} style={[styles.deckImage, isLandscape && styles.deckImageLandscape]} />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
  },
  borderGlow: {
    ...StyleSheet.absoluteFill,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    zIndex: 10,
  },
  fullFlash: {
    ...StyleSheet.absoluteFill,
  },
  half: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: spacing.xl,
  },
  wordOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  hintTop: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  hintBottom: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    alignItems: 'center',
    gap: 2,
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
  deckImage: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 48,
    height: 48,
  },
  deckImageLandscape: {
    width: 34,
    height: 34,
  },
  wordText: {
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    letterSpacing: -0.5,
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
