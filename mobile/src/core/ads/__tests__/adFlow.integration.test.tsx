/**
 * Testy integracyjne: flow reklamy
 *
 * Sprawdzają współpracę AdsProvider ↔ useInterstitialAd ↔ useRewardedAd.
 *
 * Testy inicjalizacji SDK (czy mobileAds().initialize() jest wywoływane)
 * są w AdsProvider.test.tsx (unit). Tu skupiamy się na integracji:
 *  - useInterstitialAd tworzy reklamę gdy canShowAds = true
 *  - useInterstitialAd nie tworzy reklamy gdy canShowAds = false (premium)
 *  - useRewardedAd tworzy reklamę i obsługuje earned_reward
 *  - AdsProvider canShowAds = true po inicjalizacji dla non-premium
 *  - AdsProvider canShowAds = false dla premium (init pominięty)
 */
import React from 'react';
import { renderHook, render, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AdsProvider, AdsContext, useAdsContext } from '../AdsProvider';
import { useInterstitialAd } from '../useInterstitialAd';
import { useRewardedAd } from '../useRewardedAd';

// ── Mocki ─────────────────────────────────────────────────────────────────────

jest.mock('../../../config/env', () => ({
  env: {
    firebase: {},
    admob: { appIdIos: null, appIdAndroid: null, rewardedId: null, interstitialId: null, bannerId: null },
    revenuecat: { apiKeyIos: null, apiKeyAndroid: null },
  },
}));

jest.mock('expo-tracking-transparency', () => ({
  requestTrackingPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));

jest.mock('react-native-google-mobile-ads', () => {
  const fakeAd = () => ({
    addAdEventListener: jest.fn().mockReturnValue(jest.fn()),
    load: jest.fn(),
    show: jest.fn(),
  });
  return {
    __esModule: true,
    default: jest.fn(() => ({ initialize: jest.fn().mockResolvedValue([]) })),
    AdsConsent: {
      gatherConsent: jest.fn().mockResolvedValue({}),
      getConsentInfo: jest.fn().mockResolvedValue({ canRequestAds: true }),
    },
    InterstitialAd: { createForAdRequest: jest.fn().mockImplementation(fakeAd) },
    RewardedAd: { createForAdRequest: jest.fn().mockImplementation(fakeAd) },
    TestIds: { INTERSTITIAL: 'test/interstitial', REWARDED: 'test/rewarded' },
  };
});

// ── Helpery ───────────────────────────────────────────────────────────────────

/**
 * Wrapper z bezpośrednim wstrzyknięciem wartości kontekstu —
 * omija async init, pozwala testować hooki w izolacji.
 */
function adsContextWrapper(canShowAds: boolean) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AdsContext.Provider value={{ adsInitialized: canShowAds, canShowAds }}>
        {children}
      </AdsContext.Provider>
    );
  };
}

function AdsConsumer() {
  const { canShowAds, adsInitialized } = useAdsContext();
  return (
    <>
      <Text testID="can-show">{String(canShowAds)}</Text>
      <Text testID="initialized">{String(adsInitialized)}</Text>
    </>
  );
}

// ── Testy ─────────────────────────────────────────────────────────────────────

describe('Flow reklamy — integracja', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('AdsProvider — inicjalizacja SDK', () => {
    // Uwaga: test "canShowAds = true po init dla non-premium" jest w AdsProvider.test.tsx (unit).
    // Dynamic import() w jest-expo nie kończy się w jednym flush act() — testujemy
    // zachowanie hooków przez bezpośrednie wstrzyknięcie AdsContext poniżej.

    it('premium: inicjalizacja SDK pominięta, canShowAds = false', async () => {
      const mobileAds = jest.requireMock('react-native-google-mobile-ads').default;
      const { getByTestId } = render(<AdsProvider isPremium><AdsConsumer /></AdsProvider>);
      await act(async () => {});
      expect(mobileAds).not.toHaveBeenCalled();
      expect(getByTestId('can-show').props.children).toBe('false');
    });
  });

  describe('useInterstitialAd', () => {
    it('canShowAds = true: InterstitialAd.createForAdRequest wywołane', () => {
      const { InterstitialAd } = jest.requireMock('react-native-google-mobile-ads');
      renderHook(() => useInterstitialAd(), { wrapper: adsContextWrapper(true) });
      expect(InterstitialAd.createForAdRequest).toHaveBeenCalledTimes(1);
    });

    it('canShowAds = true: ad.load() wywołane', () => {
      const { InterstitialAd } = jest.requireMock('react-native-google-mobile-ads');
      renderHook(() => useInterstitialAd(), { wrapper: adsContextWrapper(true) });
      const adInstance = InterstitialAd.createForAdRequest.mock.results[0]?.value;
      expect(adInstance?.load).toHaveBeenCalledTimes(1);
    });

    it('canShowAds = false (premium): InterstitialAd.createForAdRequest NIE wywołane', () => {
      const { InterstitialAd } = jest.requireMock('react-native-google-mobile-ads');
      renderHook(() => useInterstitialAd(), { wrapper: adsContextWrapper(false) });
      expect(InterstitialAd.createForAdRequest).not.toHaveBeenCalled();
    });

    it('isLoaded = false przed zdarzeniem "loaded"', () => {
      const { result } = renderHook(() => useInterstitialAd(), { wrapper: adsContextWrapper(true) });
      expect(result.current.isLoaded).toBe(false);
    });

    it('isLoaded = true po zdarzeniu "loaded"', async () => {
      const { InterstitialAd } = jest.requireMock('react-native-google-mobile-ads');
      const { result } = renderHook(() => useInterstitialAd(), { wrapper: adsContextWrapper(true) });

      const adInstance = InterstitialAd.createForAdRequest.mock.results[0]?.value;
      const onLoaded = (adInstance?.addAdEventListener as jest.Mock)
        .mock.calls.find(([event]: [string]) => event === 'loaded')?.[1];

      await act(async () => { onLoaded?.(); });
      expect(result.current.isLoaded).toBe(true);
    });
  });

  describe('useRewardedAd', () => {
    it('canShowAds = true: RewardedAd.createForAdRequest wywołane', () => {
      const { RewardedAd } = jest.requireMock('react-native-google-mobile-ads');
      renderHook(() => useRewardedAd(), { wrapper: adsContextWrapper(true) });
      expect(RewardedAd.createForAdRequest).toHaveBeenCalledTimes(1);
    });

    it('canShowAds = true: ad.load() wywołane', () => {
      const { RewardedAd } = jest.requireMock('react-native-google-mobile-ads');
      renderHook(() => useRewardedAd(), { wrapper: adsContextWrapper(true) });
      const adInstance = RewardedAd.createForAdRequest.mock.results[0]?.value;
      expect(adInstance?.load).toHaveBeenCalledTimes(1);
    });

    it('canShowAds = false (premium): RewardedAd.createForAdRequest NIE wywołane', () => {
      const { RewardedAd } = jest.requireMock('react-native-google-mobile-ads');
      renderHook(() => useRewardedAd(), { wrapper: adsContextWrapper(false) });
      expect(RewardedAd.createForAdRequest).not.toHaveBeenCalled();
    });

    it('callback earned_reward wywołany przy zdarzeniu', async () => {
      const { RewardedAd } = jest.requireMock('react-native-google-mobile-ads');
      const { result } = renderHook(() => useRewardedAd(), { wrapper: adsContextWrapper(true) });

      const adInstance = RewardedAd.createForAdRequest.mock.results[0]?.value;
      const addListener = adInstance?.addAdEventListener as jest.Mock;

      const loadedCb = addListener.mock.calls.find(([e]: [string]) => e === 'loaded')?.[1];
      await act(async () => { loadedCb?.(); });

      const onRewarded = jest.fn();
      act(() => { result.current.show(onRewarded); });

      const rewardCb = addListener.mock.calls.find(([e]: [string]) => e === 'earned_reward')?.[1];
      act(() => { rewardCb?.({ type: 'coins', amount: 5 }); });

      expect(onRewarded).toHaveBeenCalledWith({ type: 'coins', amount: 5 });
    });
  });
});
