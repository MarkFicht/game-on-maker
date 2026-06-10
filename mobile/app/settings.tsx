import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../src/shared/components';
import { colors, spacing } from '../src/shared/theme';

// Phase 6 — rozbudować ustawienia (dźwięk, powiadomienia, konto)
export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Typography variant="body" color={colors.textSecondary} align="center">
        Ustawienia — Faza 6
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
    padding: spacing.xl,
  },
});
