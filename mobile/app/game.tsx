import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../src/shared/components';
import { colors } from '../src/shared/theme';

// Phase 6 — zastąpić zawartością src/game/screens/GameScreen.tsx
export default function GameScreen() {
  return (
    <View style={styles.container}>
      <Typography variant="h2" align="center">
        Ekran gry
      </Typography>
      <Typography variant="body" color={colors.textSecondary} align="center">
        Mechanika gry — Faza 6
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
