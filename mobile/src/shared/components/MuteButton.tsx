import { useRef, useMemo } from 'react';
import { View, Pressable, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../../game/hooks/useSettings';
import { playClickSound } from '../sound/clickSound';

interface MuteButtonProps {
  size?: 'sm' | 'md';
  icon?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
}

const SIZES = {
  md: { outer: 52, icon: 22 },
  sm: { outer: 40, icon: 17 },
};

export function MuteButton({ size = 'md', icon, onPress, accessibilityLabel }: MuteButtonProps) {
  const { settings, updateSettings } = useSettings();
  const isMuted = !settings.soundEnabled;
  const s = SIZES[size];

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

  const handlePress = onPress ?? (() => updateSettings({ soundEnabled: !settings.soundEnabled }));
  const displayIcon = icon ?? (isMuted ? '🔇' : '🔊');
  const a11yLabel   = accessibilityLabel ?? (isMuted ? 'Włącz dźwięk' : 'Wycisz');

  return (
    <View style={[styles.shadow, { width: s.outer, height: s.outer, borderRadius: s.outer / 2 }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.clip, { width: s.outer, height: s.outer, borderRadius: s.outer / 2 }]}
        accessibilityLabel={a11yLabel}
      >
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: convexOpacity, borderRadius: s.outer / 2 }]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.35)', 'rgba(0,0,0,0.12)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: s.outer / 2 }]}
          />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: pressAnim, borderRadius: s.outer / 2 }]}>
          <LinearGradient
            colors={['rgba(0,0,0,0.22)', 'rgba(255,255,255,0.22)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: s.outer / 2 }]}
          />
        </Animated.View>
        <View style={[styles.inner, { width: s.outer, height: s.outer, borderRadius: s.outer / 2 }]}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: convexOpacity, borderRadius: s.outer / 2 }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.24)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.20)']}
              locations={[0, 0.38, 0.62, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: s.outer / 2 }]}
              pointerEvents="none"
            />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: pressAnim, borderRadius: s.outer / 2 }]}>
            <LinearGradient
              colors={['rgba(0,0,0,0.18)', 'rgba(0,0,0,0)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.18)']}
              locations={[0, 0.38, 0.62, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: s.outer / 2 }]}
              pointerEvents="none"
            />
          </Animated.View>
          <Text style={{ fontSize: s.icon, marginBottom: 2 }}>{displayIcon}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    // Android needs an actual (even fully transparent) background drawable to
    // clip the elevation shadow to the circular borderRadius — without it, the
    // shadow falls back to the square view bounds and shows as a halo/ring.
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.40,
    shadowRadius: 6,
    elevation: 5,
  },
  clip: {
    overflow: 'hidden',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
});
