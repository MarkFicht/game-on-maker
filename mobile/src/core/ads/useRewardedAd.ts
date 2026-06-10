import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useAdsContext } from './AdsProvider';
import { env } from '../../config/env';

interface Reward {
  type: string;
  amount: number;
}

interface UseRewardedAdReturn {
  isLoaded: boolean;
  show: (onRewarded: (reward: Reward) => void) => void;
  error: Error | null;
}

export function useRewardedAd(): UseRewardedAdReturn {
  const { canShowAds } = useAdsContext();
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const adRef = useRef<ReturnType<typeof createAd> | null>(null);
  const onRewardedRef = useRef<((reward: Reward) => void) | null>(null);

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
      const unsubReward = ad.addAdEventListener(
        'earned_reward',
        (reward: Reward) => {
          onRewardedRef.current?.(reward);
        },
      );

      ad.load();

      return () => {
        unsubLoaded();
        unsubError();
        unsubClosed();
        unsubReward();
      };
    } catch {
      return undefined;
    }
  }, [canShowAds]);

  const show = useCallback(
    (onRewarded: (reward: Reward) => void) => {
      if (isLoaded && adRef.current) {
        onRewardedRef.current = onRewarded;
        adRef.current.show();
      }
    },
    [isLoaded],
  );

  return { isLoaded, show, error };
}

function createAd() {
  const { RewardedAd, TestIds } = require('react-native-google-mobile-ads');
  const adUnitId = __DEV__
    ? TestIds.REWARDED
    : (env.admob.rewardedId ?? TestIds.REWARDED);
  return RewardedAd.createForAdRequest(adUnitId);
}
