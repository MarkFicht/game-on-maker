import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../../hooks/useSettings';

interface MuteButtonProps {
  size?: 'sm' | 'md';
}

const SIZES = {
  md: { outer: 52, icon: 22, bevel: 3 },
  sm: { outer: 40, icon: 17, bevel: 2 },
};

export function MuteButton({ size = 'md' }: MuteButtonProps) {
  const { settings, updateSettings } = useSettings();
  const isMuted = !settings.soundEnabled;
  const s = SIZES[size];
  const inner = s.outer - s.bevel * 2;

  return (
    // Shadow wrapper — not overflow:hidden so shadow shows on iOS
    <View style={[styles.shadow, { width: s.outer, height: s.outer, borderRadius: s.outer / 2 }]}>
      {/* Clip wrapper — clips gradient to circle on Android */}
      <TouchableOpacity
        onPress={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
        style={[styles.clip, { width: s.outer, height: s.outer, borderRadius: s.outer / 2 }]}
        accessibilityLabel={isMuted ? 'Włącz dźwięk' : 'Wycisz'}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.12)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.bevel, { padding: s.bevel }]}
        >
          <View style={[styles.inner, { width: inner, height: inner, borderRadius: inner / 2 }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.24)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.20)']}
              locations={[0, 0.38, 0.62, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <Text style={{ fontSize: s.icon }}>{isMuted ? '🔇' : '🔊'}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.40,
    shadowRadius: 6,
    elevation: 5,
  },
  clip: {
    overflow: 'hidden',
  },
  bevel: {
    flex: 1,
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(22,36,58,0.82)',
    overflow: 'hidden',
  },
});
