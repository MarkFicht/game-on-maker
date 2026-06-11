import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, Filter, FeGaussianBlur } from 'react-native-svg';
import { colors } from '../../shared/theme/colors';
import { formatTime } from '../utils';

interface TimerRingProps {
  timeRemaining: number;
  totalTime: number;
  size?: number;
  strokeWidth?: number;
}

export function TimerRing({ timeRemaining, totalTime, size = 80, strokeWidth = 6 }: TimerRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = totalTime > 0 ? timeRemaining / totalTime : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const isLow = progress <= 0.25;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLow) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isLow]);

  const ringColor =
    progress > 0.5 ? colors.success : progress > 0.25 ? colors.warning : colors.error;

  const glowColor =
    progress > 0.5
      ? 'rgba(16,185,129,0.35)'
      : progress > 0.25
        ? 'rgba(245,158,11,0.35)'
        : 'rgba(239,68,68,0.45)';

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size + 20, height: size + 20, transform: [{ scale: pulseAnim }] },
        // Glow shadow
        {
          shadowColor: ringColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isLow ? 0.9 : 0.5,
          shadowRadius: isLow ? 14 : 8,
          elevation: 10,
        },
      ]}
    >
      {/* Glow ring (blurred duplicate, behind) */}
      <View style={[StyleSheet.absoluteFill, styles.glowRing, { borderColor: glowColor }]} />

      <Svg width={size} height={size} style={styles.svg}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>

      <View style={styles.label}>
        <Text style={[styles.time, { color: ringColor, fontSize: size > 70 ? 16 : 13 }]}>
          {formatTime(timeRemaining)}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  glowRing: {
    borderRadius: 999,
    borderWidth: 2,
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  label: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
