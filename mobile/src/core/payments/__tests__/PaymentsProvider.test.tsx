import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { PaymentsProvider, usePaymentsContext } from '../PaymentsProvider';

jest.mock('../../../config/env', () => ({
  env: {
    firebase: { apiKey: 'x', authDomain: 'x', projectId: 'x', storageBucket: 'x', messagingSenderId: 'x', appId: 'x', webClientId: null },
    admob: {},
    revenuecat: { apiKeyIos: 'test-rc-key', apiKeyAndroid: 'test-rc-key' },
  },
}));

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    setLogLevel: jest.fn(),
    configure: jest.fn(),
    getCustomerInfo: jest.fn().mockResolvedValue({
      entitlements: { active: {} },
    }),
    addCustomerInfoUpdateListener: jest.fn(),
    restorePurchases: jest.fn(),
    getOfferings: jest.fn().mockResolvedValue({ current: null }),
    purchasePackage: jest.fn(),
  },
  LOG_LEVEL: { WARN: 'WARN' },
}));

function TestConsumer() {
  const { isPremium, isLoading } = usePaymentsContext();
  return (
    <>
      <Text testID="premium">{String(isPremium)}</Text>
      <Text testID="loading">{String(isLoading)}</Text>
    </>
  );
}

describe('PaymentsProvider', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders children', () => {
    const { getByText } = render(
      <PaymentsProvider><Text>Hello</Text></PaymentsProvider>,
    );
    expect(getByText('Hello')).toBeTruthy();
  });

  it('isPremium is false for new user', async () => {
    const { getByTestId } = render(
      <PaymentsProvider><TestConsumer /></PaymentsProvider>,
    );
    await act(async () => {});
    expect(getByTestId('premium').props.children).toBe('false');
  });

  it('isPremium is true when entitlement is active', async () => {
    const Purchases = jest.requireMock('react-native-purchases').default;
    Purchases.getCustomerInfo.mockResolvedValueOnce({
      entitlements: { active: { premium: { isActive: true } } },
    });

    const { getByTestId } = render(
      <PaymentsProvider><TestConsumer /></PaymentsProvider>,
    );
    await act(async () => {});
    expect(getByTestId('premium').props.children).toBe('true');
  });

  it('isLoading becomes false after init', async () => {
    const { getByTestId } = render(
      <PaymentsProvider><TestConsumer /></PaymentsProvider>,
    );
    await act(async () => {});
    expect(getByTestId('loading').props.children).toBe('false');
  });

  it('usePaymentsContext returns defaults outside provider', () => {
    const { getByTestId } = render(<TestConsumer />);
    expect(getByTestId('premium').props.children).toBe('false');
    expect(getByTestId('loading').props.children).toBe('true');
  });
});
