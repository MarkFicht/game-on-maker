import { Stack } from 'expo-router';
import { AuthProvider } from '../src/core/auth/AuthProvider';
import { AdsProvider } from '../src/core/ads/AdsProvider';
import { colors } from '../src/shared/theme';

export default function RootLayout() {
  // isPremium: false until Phase 5 (RevenueCat) wires up the real value
  return (
    <AuthProvider>
      <AdsProvider isPremium={false}>
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
      </AdsProvider>
    </AuthProvider>
  );
}
