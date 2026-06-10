import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useAdsContext } from './AdsProvider';
import { env } from '../../config/env';

interface UseInterstitialAdReturn {
  isLoaded: boolean;
  show: () => void;
  error: Error | null;
}

export function useInterstitialAd(): UseInterstitialAdReturn {
  const { canShowAds } = useAdsContext();
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const adRef = useRef<ReturnType<typeof createAd> | null>(null);

  useEffect(() => {
    if (!canShowAds || Platform.OS === 'web') return;

    try {
      const ad = createAd();
      adRef.current = ad;

      const unsubLoaded = ad.addAdEventListener('loaded', () => {
        setIsLoaded(true);
        setError(null);
      });
      const unsubError = ad.addAdEventListener('error', (e: Error) => {
        setError(e);
        setIsLoaded(false);
      });
      const unsubClosed = ad.addAdEventListener('closed', () => {
        setIsLoaded(false);
        ad.load();
      });

      ad.load();

      return () => {
        unsubLoaded();
        unsubError();
        unsubClosed();
      };
    } catch {
      return undefined;
    }
  }, [canShowAds]);

  const show = useCallback(() => {
    if (isLoaded && adRef.current) {
      adRef.current.show();
    }
  }, [isLoaded]);

  return { isLoaded, show, error };
}

function createAd() {
  const { InterstitialAd, TestIds } = require('react-native-google-mobile-ads');
  const adUnitId = __DEV__
    ? TestIds.INTERSTITIAL
    : (env.admob.interstitialId ?? TestIds.INTERSTITIAL);
  return InterstitialAd.createForAdRequest(adUnitId);
}
