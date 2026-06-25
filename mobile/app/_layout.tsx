import React, { useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider, useAuthContext } from '../src/core/auth/AuthProvider';
import { PaymentsProvider, usePaymentsContext } from '../src/core/payments/PaymentsProvider';
import { AdsProvider } from '../src/core/ads/AdsProvider';
import { AppReadyContext } from '../src/core/AppReadyContext';
import { AppSplashScreen, PageHeader } from '../src/shared/components';

function AdsProviderBridge({ children }: { children: React.ReactNode }) {
  const { isPremium } = usePaymentsContext();
  return <AdsProvider isPremium={isPremium}>{children}</AdsProvider>;
}

// Inside AuthProvider so it can read auth loading state.
// Renders children immediately (providers keep initialising underneath),
// then overlays the animated splash until auth + animation are both done.
function SplashGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuthContext();
  const [splashDone, setSplashDone] = useState(false);

  return (
    <AppReadyContext.Provider value={splashDone}>
      <View style={{ flex: 1 }}>
        {children}
        {!splashDone && (
          <AppSplashScreen
            isAuthReady={!isLoading}
            onDone={() => setSplashDone(true)}
          />
        )}
      </View>
    </AppReadyContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaymentsProvider>
        <AdsProviderBridge>
          <SplashGate>
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
          </SplashGate>
        </AdsProviderBridge>
      </PaymentsProvider>
    </AuthProvider>
  );
}
