import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { router, useFocusEffect } from 'expo-router';
import { MuteButton } from './MuteButton';
import { colors, spacing, borderRadius } from '../theme';
import { useSettings } from '../../game/hooks/useSettings';
import { playClickSound } from '../sound/clickSound';

interface PageHeaderProps {
  title?: string;
  /** shows ⚙️ on left → navigates to /settings (home screen only) */
  isHome?: boolean;
  /** shows ← on left via stack navigator */
  showBack?: boolean;
  /** custom back handler — also shows ← if provided */
  onBack?: () => void;
}

const BTN = 52;

function BackChevron() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke="white"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HeaderBtn({ onPress, label }: { onPress: () => void; label: string }) {
  const { settings } = useSettings();
  const pressAnim = useRef(new Animated.Value(0)).current;
  const convexOpacity = useMemo(
    () => pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
    [],
  );

  const onPressIn = () => {
    if (settings.soundEnabled) playClickSound();
    Animated.timing(pressAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };
  const onPressOut = () => Animated.timing(pressAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();

  return (
    <View style={styles.btnShadow}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.btnClip}
        accessibilityRole="button"
      >
        {/* Convex bevel — fades out on press */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: convexOpacity, borderRadius: BTN / 2 }]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.35)', 'rgba(0,0,0,0.12)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: BTN / 2 }]}
          />
        </Animated.View>
        {/* Concave bevel — fades in on press */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: pressAnim, borderRadius: BTN / 2 }]}>
          <LinearGradient
            colors={['rgba(0,0,0,0.22)', 'rgba(255,255,255,0.22)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: BTN / 2 }]}
          />
        </Animated.View>
        {/* Inner circle — overlays cross-fade, clips content to circle */}
        <View style={styles.btnInner}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: convexOpacity, borderRadius: BTN / 2 }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.24)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.20)']}
              locations={[0, 0.38, 0.62, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: BTN / 2 }]}
              pointerEvents="none"
            />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: pressAnim, borderRadius: BTN / 2 }]}>
            <LinearGradient
              colors={['rgba(0,0,0,0.18)', 'rgba(0,0,0,0)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.18)']}
              locations={[0, 0.38, 0.62, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: BTN / 2 }]}
              pointerEvents="none"
            />
          </Animated.View>
          {label === '←' ? <BackChevron /> : <Text style={styles.btnLabel}>{label}</Text>}
        </View>
      </Pressable>
    </View>
  );
}

export function PageHeader({ title = 'Dummy', isHome = false, showBack = false, onBack }: PageHeaderProps) {
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide   = useRef(new Animated.Value(-18)).current;
  const titleAnim    = useRef<Animated.CompositeAnimation | null>(null);

  useFocusEffect(
    useCallback(() => {
      titleAnim.current?.stop();
      titleOpacity.setValue(0);
      titleSlide.setValue(-18);
      titleAnim.current = Animated.parallel([
        // Fast opacity so the (mostly-opaque) badge covers the busy page
        // background quickly — only the slide should read as "slow".
        Animated.timing(titleOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(titleSlide, { toValue: 0, tension: 32, friction: 11, useNativeDriver: true }),
      ]);
      titleAnim.current.start();
      return () => { titleAnim.current?.stop(); };
    }, [title])
  );

  // Show left button when: home screen (gear), explicit showBack, or custom onBack provided
  const showLeft = isHome || showBack || !!onBack;

  const handleLeft = () => {
    if (isHome) router.push('/settings');
    else if (onBack) onBack();
    else router.back();
  };

  return (
    <View style={styles.header}>
      {/* Left slot — fixed width keeps center truly centered */}
      <View style={styles.sideSlot}>
        {showLeft && <HeaderBtn onPress={handleLeft} label={isHome ? '⚙️' : '←'} />}
      </View>

      {/* Center — title badge animates in from top on each title change */}
      <View style={styles.centerSlot}>
        <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleSlide }] }}>
        <View style={styles.titleShadow}>
          {/* Title badge: subtle glass bevel — neutral light/shadow, no color accent */}
          <LinearGradient
            colors={['rgba(255,255,255,0.22)', 'rgba(0,0,0,0.30)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.titleBevel}
          >
            <View style={styles.titleInner}>
              <LinearGradient
                colors={['rgba(255,255,255,0.20)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.24)']}
                locations={[0, 0.38, 0.62, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <Text style={styles.titleText}>{title}</Text>
            </View>
          </LinearGradient>
        </View>
        </Animated.View>
      </View>

      {/* Right slot — MuteButton always visible */}
      <View style={styles.sideSlot}>
        <MuteButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },

  // Fixed-width side slots — center is always truly centered
  sideSlot: {
    width: BTN,
    height: BTN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerSlot: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingTop: 4,
  },

  // ── Icon button (⚙️ / ←) ──────────────────────────────────
  btnShadow: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.40,
    shadowRadius: 6,
    // Android only honors `elevation` (shadowColor/Offset/Opacity/Radius are
    // iOS-only) and renders it as its own fixed Material shadow shape —
    // toned down from 5 since it was showing as a halo/ring around the
    // circular button on Android.
    elevation: 2,
  },
  btnClip: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    overflow: 'hidden',
  },
  // Explicit circular inner — clips overlay gradients to circle
  btnInner: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  btnLabel: {
    fontSize: 22,
    marginBottom: 2,
    color: colors.white,
  },

  // ── Title badge ───────────────────────────────────────────
  titleShadow: {
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.42,
    shadowRadius: 8,
    elevation: 5,
  },
  titleBevel: {
    borderRadius: borderRadius.lg,
    padding: 3, // thicker "chrome edge"
  },
  titleInner: {
    borderRadius: borderRadius.lg - 3,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(8,16,36,0.92)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
});
