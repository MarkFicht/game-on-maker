import React, { useRef, useMemo } from 'react';
import {
  Pressable,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  Animated,
  Image,
} from 'react-native';
import { colors, spacing, borderRadius } from '../theme';
import { useSettings } from '../../game/hooks/useSettings';
import { playClickSound } from '../sound/clickSound';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
type Size = 'sm' | 'md' | 'lg';

// Pre-baked PNGs for the (non-dynamic) gradients below — see
// scripts/generate-gradients.js. A bitmap blit is cheaper for the GPU than
// computing a gradient shader, and this is the most-instantiated component
// in the app. Always mounted (never conditionally), same as the live
// gradients they replace — conditionally mounting these caused a one-frame
// decode flicker the first time a freshly-mounted image appeared (see
// CustomSwitch's OFF/ON history in app/settings.tsx).
const BEVEL_IMG: Record<Variant, { convex: number; concave: number }> = {
  primary:   { convex: require('../../../assets/gradients/button_primary_convex.png'), concave: require('../../../assets/gradients/button_primary_concave.png') },
  secondary: { convex: require('../../../assets/gradients/button_secondary_convex.png'), concave: require('../../../assets/gradients/button_secondary_concave.png') },
  danger:    { convex: require('../../../assets/gradients/button_danger_convex.png'), concave: require('../../../assets/gradients/button_danger_concave.png') },
  outline:   { convex: require('../../../assets/gradients/button_outline_convex.png'), concave: require('../../../assets/gradients/button_outline_concave.png') },
  ghost:     { convex: require('../../../assets/gradients/button_ghost_convex.png'), concave: require('../../../assets/gradients/button_ghost_concave.png') },
  accent:    { convex: require('../../../assets/gradients/button_accent_convex.png'), concave: require('../../../assets/gradients/button_accent_concave.png') },
};
const DEPTH_IMG = require('../../../assets/gradients/button_depth_convex.png');
const DEPTH_CONCAVE_IMG = require('../../../assets/gradients/button_depth_concave.png');
// Like StyleSheet.absoluteFill, but overshoots every edge by 1px — Image's
// own borderRadius clipping anti-aliases very slightly differently from
// LinearGradient's, leaving a hairline gap at rounded corners otherwise.
// The parent's overflow:hidden / clip crops this overscan away.
const IMAGE_FILL = { position: 'absolute', top: -1, left: -1, right: -1, bottom: -1 } as const;

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
  icon?: string;
}

const textSizeMap: Record<Size, number> = {
  sm: 13,
  md: 16,
  lg: 18,
};

const innerBg: Record<Variant, string> = {
  primary:   colors.primary,
  secondary: colors.secondary,
  danger:    '#EF4444',
  outline:   'rgba(22,36,58,0.72)',
  ghost:     'rgba(255,255,255,0.04)',
  accent:    '#F97316',
};

const textColors: Record<Variant, string> = {
  primary:   colors.white,
  secondary: colors.white,
  danger:    colors.white,
  outline:   colors.white,
  ghost:     colors.primaryLight,
  accent:    colors.white,
};

const bevelShadow: Record<Variant, ViewStyle> = {
  primary: {
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 8,
  },
  secondary: {
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 8,
  },
  danger: {
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 8,
  },
  outline: {
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.30,
    shadowRadius: 5,
    elevation: 4,
  },
  ghost: {},
  // Bigger than the other variants — this is the app's primary CTA (Home's
  // "Zagraj", Game's "Start"), which already had a more pronounced shadow.
  accent: {
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.58,
    shadowRadius: 10,
    elevation: 12,
  },
};

const sizeStyles: Record<Size, ViewStyle> = {
  sm: { paddingVertical: spacing.xs,      paddingHorizontal: spacing.md },
  md: { paddingVertical: spacing.sm + 4,  paddingHorizontal: spacing.lg },
  lg: { paddingVertical: spacing.md,      paddingHorizontal: spacing.xl },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  testID,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const radius = borderRadius.xl;
  const innerRadius = radius - 4;
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
    <Pressable
      testID={testID}
      onPress={onPress}
      onPressIn={isDisabled ? undefined : onPressIn}
      onPressOut={isDisabled ? undefined : onPressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={[isDisabled && styles.disabled, style]}
    >
      {/* Shadow wrapper — no overflow:hidden so iOS shadow renders */}
      <View style={[styles.wrapper, { borderRadius: radius }, bevelShadow[variant]]}>
        {/* Convex bevel — fades out on press */}
        <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: radius, opacity: convexOpacity, overflow: 'hidden' }]}>
          <Image source={BEVEL_IMG[variant].convex} resizeMode="stretch" style={IMAGE_FILL} />
        </Animated.View>
        {/* Concave bevel — fades in on press */}
        <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: radius, opacity: pressAnim, overflow: 'hidden' }]}>
          <Image source={BEVEL_IMG[variant].concave} resizeMode="stretch" style={IMAGE_FILL} />
        </Animated.View>
        {/* Inner face */}
        <View
          style={[
            styles.inner,
            sizeStyles[size],
            { backgroundColor: innerBg[variant], borderRadius: innerRadius },
          ]}
        >
          {/* Convex depth overlay — fades out on press */}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: convexOpacity }]}>
            <Image source={DEPTH_IMG} resizeMode="stretch" style={IMAGE_FILL} />
          </Animated.View>
          {/* Concave depth overlay — fades in on press */}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: pressAnim }]}>
            <Image source={DEPTH_CONCAVE_IMG} resizeMode="stretch" style={IMAGE_FILL} />
          </Animated.View>
          {loading ? (
            <ActivityIndicator color={textColors[variant]} testID="button-loading-indicator" />
          ) : (
            <Text
              style={[
                styles.buttonText,
                { fontSize: textSizeMap[size], color: isDisabled ? colors.textDisabled : textColors[variant] },
              ]}
            >
              {icon ? `${icon}  ${label}` : label}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  wrapper: {
    // Shadow host — must not have overflow:hidden
  },
  inner: {
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonText: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
