import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface AdsContextValue {
  adsInitialized: boolean;
  canShowAds: boolean;
}

const AdsContext = createContext<AdsContextValue>({
  adsInitialized: false,
  canShowAds: false,
});

interface AdsProviderProps {
  children?: React.ReactNode;
  isPremium?: boolean;
}

export function AdsProvider({ children, isPremium = false }: AdsProviderProps) {
  const [adsInitialized, setAdsInitialized] = useState(false);

  useEffect(() => {
    if (isPremium) return;
    initializeAds().then(setAdsInitialized).catch(() => setAdsInitialized(false));
  }, [isPremium]);

  return (
    <AdsContext.Provider value={{ adsInitialized, canShowAds: !isPremium && adsInitialized }}>
      {children}
    </AdsContext.Provider>
  );
}

export function useAdsContext(): AdsContextValue {
  return useContext(AdsContext);
}

async function initializeAds(): Promise<boolean> {
  // Native modules unavailable on web
  if (Platform.OS === 'web') return false;

  try {
    const [{ requestTrackingPermissionsAsync }, mobileAdsModule] = await Promise.all([
      import('expo-tracking-transparency'),
      import('react-native-google-mobile-ads'),
    ]);

    // iOS: ATT permission must come before consent form
    if (Platform.OS === 'ios') {
      await requestTrackingPermissionsAsync();
    }

    const { AdsConsent, default: mobileAds } = mobileAdsModule;

    // GDPR: gather consent (shows form if needed, no-op outside EEA)
    await AdsConsent.gatherConsent();

    const { canRequestAds } = await AdsConsent.getConsentInfo();
    if (!canRequestAds) return false;

    await mobileAds().initialize();
    return true;
  } catch {
    // Expo Go or simulator — ads unavailable
    return false;
  }
}
