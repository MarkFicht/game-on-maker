import React from 'react';
import {
  TouchableOpacity,
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme';
import { Typography } from './Typography';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
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
}

const radiusMap: Record<Size, number> = {
  sm: borderRadius.md,
  md: borderRadius.md,
  lg: borderRadius.lg,
};

// Layer 1: bevel border — tinted from button color, not white/black chrome.
// Top = button_color + 40% white (light tint), Bottom = button_color × 60% (dark tint).
const bevelColors: Record<Variant, readonly [string, string]> = {
  primary:   ['#9590EF', '#2F2A89'],  // indigo #4F46E5: light ↑ darker ↓
  secondary: ['#6FD5B3', '#0A6F4D'],  // green  #10B981: light ↑ darker ↓
  outline:   ['rgba(255,255,255,0.24)', 'rgba(0,0,0,0.22)'],
  ghost:     ['rgba(255,255,255,0.10)', 'rgba(0,0,0,0.06)'],
};

// Layer 2: actual button face background
const innerBg: Record<Variant, string> = {
  primary:   colors.primary,
  secondary: colors.secondary,
  outline:   'rgba(22,36,58,0.72)',
  ghost:     'rgba(255,255,255,0.04)',
};

// Layer 3: convex depth gradient — bright top, dark bottom, smooth center
const DEPTH: readonly [string, string, string, string] = [
  'rgba(255,255,255,0.22)',
  'rgba(255,255,255,0)',
  'rgba(0,0,0,0)',
  'rgba(0,0,0,0.18)',
];

const textColors: Record<Variant, string> = {
  primary:   colors.white,
  secondary: colors.white,
  outline:   colors.white,
  ghost:     colors.primaryLight,
};

// Shadow sits on the bevel LinearGradient which has a visible bg → iOS shadow works
// Tight dark shadow → button appears raised/close to screen (not glowing)
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
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const radius = radiusMap[size];

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={[isDisabled && styles.disabled, style]}
    >
      {/* Layer 1: bevel gradient border (3 px "chrome edge") */}
      <LinearGradient
        colors={bevelColors[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.bevel, { borderRadius: radius }, bevelShadow[variant]]}
      >
        {/* Layer 2: actual button face */}
        <View
          style={[
            styles.inner,
            sizeStyles[size],
            { backgroundColor: innerBg[variant], borderRadius: Math.max(1, radius - 4) },
          ]}
        >
          {/* Layer 3: convex depth overlay */}
          <LinearGradient
            colors={DEPTH}
            locations={[0, 0.38, 0.62, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          {loading ? (
            <ActivityIndicator color={textColors[variant]} testID="button-loading-indicator" />
          ) : (
            <Typography
              variant="label"
              align="center"
              color={isDisabled ? colors.textDisabled : textColors[variant]}
            >
              {label}
            </Typography>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  bevel: {
    padding: 4,
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
