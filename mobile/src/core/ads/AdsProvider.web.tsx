import React, { createContext, useContext } from 'react';

interface AdsContextValue {
  adsInitialized: boolean;
  canShowAds: boolean;
}

export const AdsContext = createContext<AdsContextValue>({
  adsInitialized: false,
  canShowAds: false,
});

interface AdsProviderProps {
  children?: React.ReactNode;
  isPremium?: boolean;
}

export function AdsProvider({ children }: AdsProviderProps) {
  return (
    <AdsContext.Provider value={{ adsInitialized: false, canShowAds: false }}>
      {children}
    </AdsContext.Provider>
  );
}

export function useAdsContext(): AdsContextValue {
  return useContext(AdsContext);
}
