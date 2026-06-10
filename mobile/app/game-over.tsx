import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Typography, Button } from '../src/shared/components';
import { colors, spacing } from '../src/shared/theme';

// Phase 6 — zastąpić zawartością src/game/screens/GameOverScreen.tsx
export default function GameOverScreen() {
  return (
    <View style={styles.container}>
      <Typography variant="h1" align="center">
        Koniec gry
      </Typography>
      <View style={styles.actions}>
        <Button label="Zagraj ponownie" onPress={() => router.replace('/game')} size="lg" />
        <Button
          label="Menu główne"
          onPress={() => router.replace('/')}
          variant="outline"
          style={styles.secondaryBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  actions: {
    marginTop: spacing.xxl,
    width: '100%',
    gap: spacing.sm,
  },
  secondaryBtn: {
    marginTop: spacing.xs,
  },
});
