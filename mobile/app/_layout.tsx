import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/core/auth/AuthProvider';
import { PaymentsProvider, usePaymentsContext } from '../src/core/payments/PaymentsProvider';
import { AdsProvider } from '../src/core/ads/AdsProvider';
import { PageHeader } from '../src/shared/components';

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
              header: ({ navigation, back, options }) => (
                <PageHeader
                  title={options.title ?? 'Dummy'}
                  showBack={back != null}
                  onBack={() => navigation.goBack()}
                />
              ),
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
              animation: 'none',
              gestureEnabled: true,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="decks" />
            <Stack.Screen name="game" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="store" />
            <Stack.Screen name="privacy" />
            <Stack.Screen name="terms" />
          </Stack>
        </AdsProviderBridge>
      </PaymentsProvider>
    </AuthProvider>
  );
}
