import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../src/shared/components';
import { colors, spacing } from '../src/shared/theme';

// Phase 5 — zastąpić pełnym ekranem RevenueCat (isPremium, purchase, restore)
export default function StoreScreen() {
  return (
    <View style={styles.container}>
      <Typography variant="body" color={colors.textSecondary} align="center">
        Sklep — Faza 5 (RevenueCat)
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
