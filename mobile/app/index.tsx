import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Typography, Button } from '../src/shared/components';
import { colors, spacing } from '../src/shared/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Typography variant="h1" align="center">
        Game On
      </Typography>
      <Typography variant="body" color={colors.textSecondary} align="center" style={styles.subtitle}>
        Gotowy na wyzwanie?
      </Typography>
      <View style={styles.actions}>
        <Button label="Zagraj" onPress={() => router.push('/game')} size="lg" />
        <Button
          label="Ustawienia"
          onPress={() => router.push('/settings')}
          variant="outline"
          style={styles.secondaryBtn}
        />
        <Button
          label="Sklep"
          onPress={() => router.push('/store')}
          variant="ghost"
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
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
  },
  secondaryBtn: {
    marginTop: spacing.xs,
  },
});
