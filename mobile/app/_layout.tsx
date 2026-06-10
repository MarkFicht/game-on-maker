import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/core/auth/AuthProvider';
import { PaymentsProvider, usePaymentsContext } from '../src/core/payments/PaymentsProvider';
import { AdsProvider } from '../src/core/ads/AdsProvider';
import { colors } from '../src/shared/theme';

// Bridge: reads isPremium from PaymentsContext, passes to AdsProvider
function AdsProviderBridge({ children }: { children: React.ReactNode }) {
  const { isPremium } = usePaymentsContext();
  return <AdsProvider isPremium={isPremium}>{children}</AdsProvider>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaymentsProvider>
        <AdsProviderBridge>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              headerTitleStyle: { fontWeight: 'bold' },
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="game" options={{ headerShown: false }} />
            <Stack.Screen name="game-over" options={{ title: 'Koniec gry' }} />
            <Stack.Screen name="settings" options={{ title: 'Ustawienia' }} />
            <Stack.Screen name="store" options={{ title: 'Sklep' }} />
          </Stack>
        </AdsProviderBridge>
      </PaymentsProvider>
    </AuthProvider>
  );
}
