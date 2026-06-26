import React, { useRef, useMemo } from 'react';
import {
  Pressable,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme';
import { useSettings } from '../../game/hooks/useSettings';
import { playClickSound } from '../sound/clickSound';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

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

// Convex bevel: top = color+light, bottom = color+dark
const bevelColors: Record<Variant, readonly [string, string]> = {
  primary:   ['#9590EF', '#2F2A89'],
  secondary: ['#6FD5B3', '#0A6F4D'],
  danger:    ['#F58F8F', '#8F2929'],
  outline:   ['rgba(255,255,255,0.24)', 'rgba(0,0,0,0.22)'],
  ghost:     ['rgba(255,255,255,0.10)', 'rgba(0,0,0,0.06)'],
};

// Concave bevel: reversed — dark on top, light on bottom
const bevelConcaveColors: Record<Variant, readonly [string, string]> = {
  primary:   ['#2F2A89', '#9590EF'],
  secondary: ['#0A6F4D', '#6FD5B3'],
  danger:    ['#8F2929', '#F58F8F'],
  outline:   ['rgba(0,0,0,0.22)', 'rgba(255,255,255,0.24)'],
  ghost:     ['rgba(0,0,0,0.06)', 'rgba(255,255,255,0.10)'],
};

const innerBg: Record<Variant, string> = {
  primary:   colors.primary,
  secondary: colors.secondary,
  danger:    '#EF4444',
  outline:   'rgba(22,36,58,0.72)',
  ghost:     'rgba(255,255,255,0.04)',
};

// Convex depth: bright top, dark bottom
const DEPTH: readonly [string, string, string, string] = [
  'rgba(255,255,255,0.22)',
  'rgba(255,255,255,0)',
  'rgba(0,0,0,0)',
  'rgba(0,0,0,0.18)',
];

// Concave depth: dark top, bright bottom
const DEPTH_CONCAVE: readonly [string, string, string, string] = [
  'rgba(0,0,0,0.18)',
  'rgba(0,0,0,0)',
  'rgba(255,255,255,0)',
  'rgba(255,255,255,0.22)',
];

const textColors: Record<Variant, string> = {
  primary:   colors.white,
  secondary: colors.white,
  danger:    colors.white,
  outline:   colors.white,
  ghost:     colors.primaryLight,
};

const bevelShadow: Record<Variant, ViewStyle> = {
  primary: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 8,
  },
  secondary: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 8,
  },
  danger: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 8,
  },
  outline: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.30,
    shadowRadius: 5,
    elevation: 4,
  },
  ghost: {},
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
        <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: radius, opacity: convexOpacity }]}>
          <LinearGradient
            colors={bevelColors[variant]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          />
        </Animated.View>
        {/* Concave bevel — fades in on press */}
        <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: radius, opacity: pressAnim }]}>
          <LinearGradient
            colors={bevelConcaveColors[variant]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          />
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
            <LinearGradient
              colors={DEPTH}
              locations={[0, 0.38, 0.62, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
          </Animated.View>
          {/* Concave depth overlay — fades in on press */}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: pressAnim }]}>
            <LinearGradient
              colors={DEPTH_CONCAVE}
              locations={[0, 0.38, 0.62, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
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
