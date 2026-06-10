import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { AdsProvider } from '../AdsProvider';
import { useInterstitialAd } from '../useInterstitialAd';

jest.mock('../../../config/env', () => ({
  env: { admob: { interstitialId: null }, firebase: {}, revenuecat: {} },
}));

jest.mock('react-native-google-mobile-ads', () => {
  const adInstance = {
    addAdEventListener: jest.fn(() => jest.fn()),
    load: jest.fn(),
    show: jest.fn(),
  };
  return {
    __esModule: true,
    default: jest.fn(() => ({ initialize: jest.fn().mockResolvedValue([]) })),
    InterstitialAd: { createForAdRequest: jest.fn(() => adInstance) },
    AdsConsent: {
      gatherConsent: jest.fn().mockResolvedValue({}),
      getConsentInfo: jest.fn().mockResolvedValue({ canRequestAds: true }),
    },
    TestIds: { INTERSTITIAL: 'test-interstitial-id' },
  };
});

jest.mock('expo-tracking-transparency', () => ({
  requestTrackingPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));

function wrapperWithAds({ children }: { children: React.ReactNode }) {
  return React.createElement(AdsProvider, { isPremium: false }, children);
}

function wrapperPremium({ children }: { children: React.ReactNode }) {
  return React.createElement(AdsProvider, { isPremium: true }, children);
}

describe('useInterstitialAd', () => {
  beforeEach(() => jest.clearAllMocks());

  it('isLoaded is false initially', () => {
    const { result } = renderHook(() => useInterstitialAd(), { wrapper: wrapperWithAds });
    expect(result.current.isLoaded).toBe(false);
  });

  it('error is null initially', () => {
    const { result } = renderHook(() => useInterstitialAd(), { wrapper: wrapperWithAds });
    expect(result.current.error).toBeNull();
  });

  it('show() does not throw when not loaded', () => {
    const { result } = renderHook(() => useInterstitialAd(), { wrapper: wrapperWithAds });
    expect(() => result.current.show()).not.toThrow();
  });

  it('does not create ad when isPremium', async () => {
    const { InterstitialAd } = jest.requireMock('react-native-google-mobile-ads');
    renderHook(() => useInterstitialAd(), { wrapper: wrapperPremium });
    await act(async () => {});
    expect(InterstitialAd.createForAdRequest).not.toHaveBeenCalled();
  });
});
