import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AdsProvider, useAdsContext } from '../AdsProvider';

jest.mock('../../../config/env', () => ({
  env: {
    firebase: { apiKey: 'test', authDomain: 'test', projectId: 'test', storageBucket: 'test', messagingSenderId: 'test', appId: 'test', webClientId: null },
    admob: { appIdIos: null, appIdAndroid: null, rewardedId: null, interstitialId: null, bannerId: null },
    revenuecat: { apiKeyIos: null, apiKeyAndroid: null },
  },
}));

jest.mock('expo-tracking-transparency', () => ({
  requestTrackingPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));

jest.mock('react-native-google-mobile-ads', () => ({
  __esModule: true,
  default: jest.fn(() => ({ initialize: jest.fn().mockResolvedValue([]) })),
  AdsConsent: {
    gatherConsent: jest.fn().mockResolvedValue({}),
    getConsentInfo: jest.fn().mockResolvedValue({ canRequestAds: true }),
  },
}));

function TestConsumer() {
  const { adsInitialized, canShowAds } = useAdsContext();
  return (
    <>
      <Text testID="initialized">{String(adsInitialized)}</Text>
      <Text testID="can-show">{String(canShowAds)}</Text>
    </>
  );
}

describe('AdsProvider', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders children', () => {
    const { getByText } = render(
      <AdsProvider>
        <Text>Hello</Text>
      </AdsProvider>,
    );
    expect(getByText('Hello')).toBeTruthy();
  });

  it('canShowAds is false initially', () => {
    const { getByTestId } = render(
      <AdsProvider>
        <TestConsumer />
      </AdsProvider>,
    );
    expect(getByTestId('can-show').props.children).toBe('false');
  });

  it('canShowAds is false when isPremium is true', async () => {
    const { getByTestId } = render(
      <AdsProvider isPremium>
        <TestConsumer />
      </AdsProvider>,
    );
    await act(async () => {});
    expect(getByTestId('can-show').props.children).toBe('false');
  });

  it('does not initialize ads when isPremium', async () => {
    const mobileAds = jest.requireMock('react-native-google-mobile-ads');
    render(
      <AdsProvider isPremium>
        <TestConsumer />
      </AdsProvider>,
    );
    await act(async () => {});
    expect(mobileAds.default).not.toHaveBeenCalled();
  });

  it('useAdsContext returns defaults outside provider', () => {
    const { getByTestId } = render(<TestConsumer />);
    expect(getByTestId('initialized').props.children).toBe('false');
    expect(getByTestId('can-show').props.children).toBe('false');
  });
});
