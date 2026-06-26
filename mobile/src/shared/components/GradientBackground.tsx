import React from 'react';
import { View, StyleSheet, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useScreenDimensions } from '../hooks/useScreenDimensions';

const bgImage = require('../../../assets/bg.jpg');

// Very light vignette — web has NO overlay at all, just raw bg.jpg
const BG_OVERLAY = ['rgba(8,12,22,0.38)', 'rgba(12,18,36,0.34)', 'rgba(18,10,32,0.40)'] as const;

interface GradientBackgroundProps {
  children: React.ReactNode;
  overlayColors?: readonly [string, string, ...string[]];
}

export function GradientBackground({ children, overlayColors = BG_OVERLAY }: GradientBackgroundProps) {
  // Explicit screen dimensions = reliable cover on every device/orientation
  const { width, height } = useScreenDimensions();

  return (
    <View style={styles.root}>
      {/* bg.jpg — explicit pixel dimensions, centered, cover */}
      <Image
        source={bgImage}
        style={{ position: 'absolute', top: 0, left: 0, width, height }}
        resizeMode="cover"
      />
      {/* Subtle dark vignette so UI is readable without hiding the blobs */}
      <LinearGradient
        colors={overlayColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
