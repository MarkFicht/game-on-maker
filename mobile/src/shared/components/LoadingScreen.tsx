import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';
import { Typography } from './Typography';

interface LoadingScreenProps {
  message?: string;
  testID?: string;
}

export function LoadingScreen({ message, testID }: LoadingScreenProps) {
  return (
    <View style={styles.container} testID={testID ?? 'loading-screen'}>
      <ActivityIndicator size="large" color={colors.primary} testID="loading-indicator" />
      {message ? (
        <Typography variant="body" color={colors.textSecondary} style={styles.message}>
          {message}
        </Typography>
      ) : null}
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
  message: {
    marginTop: spacing.md,
  },
});
