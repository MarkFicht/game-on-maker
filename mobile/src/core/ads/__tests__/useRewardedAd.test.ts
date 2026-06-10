import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { AdsProvider } from '../AdsProvider';
import { useRewardedAd } from '../useRewardedAd';

jest.mock('../../../config/env', () => ({
  env: { admob: { rewardedId: null }, firebase: {}, revenuecat: {} },
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
    RewardedAd: { createForAdRequest: jest.fn(() => adInstance) },
    AdsConsent: {
      gatherConsent: jest.fn().mockResolvedValue({}),
      getConsentInfo: jest.fn().mockResolvedValue({ canRequestAds: true }),
    },
    TestIds: { REWARDED: 'test-rewarded-id' },
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

describe('useRewardedAd', () => {
  beforeEach(() => jest.clearAllMocks());

  it('isLoaded is false initially', () => {
    const { result } = renderHook(() => useRewardedAd(), { wrapper: wrapperWithAds });
    expect(result.current.isLoaded).toBe(false);
  });

  it('error is null initially', () => {
    const { result } = renderHook(() => useRewardedAd(), { wrapper: wrapperWithAds });
    expect(result.current.error).toBeNull();
  });

  it('show() does not throw when not loaded', () => {
    const { result } = renderHook(() => useRewardedAd(), { wrapper: wrapperWithAds });
    expect(() => result.current.show(jest.fn())).not.toThrow();
  });

  it('does not create ad when isPremium', async () => {
    const { RewardedAd } = jest.requireMock('react-native-google-mobile-ads');
    renderHook(() => useRewardedAd(), { wrapper: wrapperPremium });
    await act(async () => {});
    expect(RewardedAd.createForAdRequest).not.toHaveBeenCalled();
  });
});
