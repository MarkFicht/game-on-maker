import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { usePayments } from '../src/core/payments/usePayments';
import { Typography, Button } from '../src/shared/components';
import { colors, spacing, borderRadius } from '../src/shared/theme';

export default function StoreScreen() {
  const { isPremium, isLoading, offerings, fetchOfferings, purchase, restore, isPurchasing, isRestoring } =
    usePayments();

  useEffect(() => {
    fetchOfferings();
  }, [fetchOfferings]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isPremium) {
    return (
      <View style={styles.centered}>
        <Typography variant="h2" align="center">✓ Masz Premium</Typography>
        <Typography variant="body" color={colors.textSecondary} align="center" style={styles.subtitle}>
          Dziękujemy za wsparcie! Reklamy są wyłączone.
        </Typography>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Typography variant="h2" align="center">Odblokuj Premium</Typography>
      <Typography variant="body" color={colors.textSecondary} align="center" style={styles.subtitle}>
        Usuń reklamy i wspieraj rozwój gry.
      </Typography>

      {offerings ? (
        offerings.availablePackages.map((pkg) => (
          <View key={pkg.identifier} style={styles.packageCard}>
            <Typography variant="h3">{pkg.product.title}</Typography>
            <Typography variant="body" color={colors.textSecondary} style={styles.description}>
              {pkg.product.description}
            </Typography>
            <Typography variant="h3" color={colors.primary} style={styles.price}>
              {pkg.product.priceString}
            </Typography>
            <Button
              label={isPurchasing ? 'Przetwarzanie…' : 'Kup teraz'}
              onPress={() => purchase(pkg)}
              loading={isPurchasing}
              style={styles.purchaseBtn}
            />
          </View>
        ))
      ) : (
        <View style={styles.packageCard}>
          <Typography variant="body" color={colors.textSecondary} align="center">
            Brak dostępnych ofert.{'\n'}Sprawdź połączenie z internetem.
          </Typography>
        </View>
      )}

      <Button
        label={isRestoring ? 'Przywracanie…' : 'Przywróć zakupy'}
        onPress={restore}
        variant="ghost"
        loading={isRestoring}
        style={styles.restoreBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    alignItems: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  packageCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  description: {
    marginTop: spacing.xs,
  },
  price: {
    marginTop: spacing.md,
  },
  purchaseBtn: {
    marginTop: spacing.md,
  },
  restoreBtn: {
    marginTop: spacing.lg,
  },
});
