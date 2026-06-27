import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { Stack, ThemeProvider, DarkTheme } from 'expo-router';
import { AuthProvider, useAuthContext } from '../src/core/auth/AuthProvider';
import { PaymentsProvider, usePaymentsContext } from '../src/core/payments/PaymentsProvider';
import { AdsProvider } from '../src/core/ads/AdsProvider';
import { AppReadyContext } from '../src/core/AppReadyContext';
import { AppSplashScreen, HeaderConfigProvider, PersistentPageHeader } from '../src/shared/components';

// contentStyle: transparent doesn't fully prevent the native-stack's default
// white background from flashing on Android during a screen transition —
// the navigation theme's own background color (used by the native surface
// before JS content paints) needs to match the app instead. See
// https://docs.expo.dev/router/advanced/stack/
const AppTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: '#0d1220' },
};

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
    // initialMetrics lets every screen render with correct insets on its very
    // first frame — without it, a freshly-mounted screen briefly has zero/stale
    // insets until they're measured, which shows up as the header/buttons
    // "jumping" into their real position right after navigating to a new route.
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AuthProvider>
        <PaymentsProvider>
          <AdsProviderBridge>
            <SplashGate>
              <ThemeProvider value={AppTheme}>
                <HeaderConfigProvider>
                  <View style={{ flex: 1 }}>
                    <Stack
                      screenOptions={{
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
                    {/*
                      Rendered once, here, for the whole app's lifetime — never
                      mounts/unmounts on navigation. Screens declare what it
                      should show via useHeaderConfig(); it only animates when
                      the title it receives actually changes.
                    */}
                    <SafeAreaView edges={['top']} style={styles.headerOverlay} pointerEvents="box-none">
                      <PersistentPageHeader />
                    </SafeAreaView>
                  </View>
                </HeaderConfigProvider>
              </ThemeProvider>
            </SplashGate>
          </AdsProviderBridge>
        </PaymentsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
