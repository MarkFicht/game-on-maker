import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { PaymentsProvider } from '../PaymentsProvider';
import { usePayments } from '../usePayments';

jest.mock('../../../config/env', () => ({
  env: {
    firebase: {},
    admob: {},
    revenuecat: { apiKeyIos: 'test-key', apiKeyAndroid: 'test-key' },
  },
}));

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    setLogLevel: jest.fn(),
    configure: jest.fn(),
    getCustomerInfo: jest.fn().mockResolvedValue({ entitlements: { active: {} } }),
    addCustomerInfoUpdateListener: jest.fn(),
    getOfferings: jest.fn().mockResolvedValue({
      current: {
        identifier: 'default',
        availablePackages: [
          {
            identifier: '$rc_monthly',
            product: { title: 'Premium Miesięczny', priceString: '9,99 zł', description: 'Brak reklam' },
          },
        ],
      },
    }),
    purchasePackage: jest.fn().mockResolvedValue({ customerInfo: { entitlements: { active: { premium: {} } } } }),
    restorePurchases: jest.fn().mockResolvedValue({ entitlements: { active: {} } }),
  },
  LOG_LEVEL: { WARN: 'WARN' },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(PaymentsProvider, null, children);
}

describe('usePayments', () => {
  beforeEach(() => jest.clearAllMocks());

  it('isPremium is false initially', () => {
    const { result } = renderHook(() => usePayments(), { wrapper });
    expect(result.current.isPremium).toBe(false);
  });

  it('offerings are null before fetchOfferings', () => {
    const { result } = renderHook(() => usePayments(), { wrapper });
    expect(result.current.offerings).toBeNull();
  });

  it('fetchOfferings populates offerings', async () => {
    const { result } = renderHook(() => usePayments(), { wrapper });
    await act(async () => { await result.current.fetchOfferings(); });
    expect(result.current.offerings).not.toBeNull();
    expect(result.current.offerings?.availablePackages).toHaveLength(1);
  });

  it('purchase calls Purchases.purchasePackage', async () => {
    const Purchases = jest.requireMock('react-native-purchases').default;
    const { result } = renderHook(() => usePayments(), { wrapper });
    const fakePkg = { identifier: '$rc_monthly', product: { title: 'Premium', priceString: '9,99 zł', description: '' } };
    await act(async () => { await result.current.purchase(fakePkg); });
    expect(Purchases.purchasePackage).toHaveBeenCalledTimes(1);
  });

  it('restore calls Purchases.restorePurchases', async () => {
    const Purchases = jest.requireMock('react-native-purchases').default;
    const { result } = renderHook(() => usePayments(), { wrapper });
    await act(async () => { await result.current.restore(); });
    expect(Purchases.restorePurchases).toHaveBeenCalledTimes(1);
  });
});
