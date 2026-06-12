import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
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

const FAKE_PKG = {
  identifier: '$rc_monthly',
  product: { title: 'Premium', priceString: '9,99 zł', description: '' },
};

describe('usePayments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

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

  // ── Edge case'y z długu Fazy 5 ───────────────────────────────────────────────

  it('purchase: błąd (nie userCancelled) pokazuje Alert', async () => {
    const Purchases = jest.requireMock('react-native-purchases').default;
    Purchases.purchasePackage.mockRejectedValueOnce({ userCancelled: false, message: 'Payment failed' });

    const { result } = renderHook(() => usePayments(), { wrapper });
    await act(async () => { await result.current.purchase(FAKE_PKG); });

    expect(Alert.alert).toHaveBeenCalledWith('Błąd zakupu', 'Payment failed');
  });

  it('purchase: userCancelled NIE pokazuje Alert', async () => {
    const Purchases = jest.requireMock('react-native-purchases').default;
    Purchases.purchasePackage.mockRejectedValueOnce({ userCancelled: true });

    const { result } = renderHook(() => usePayments(), { wrapper });
    await act(async () => { await result.current.purchase(FAKE_PKG); });

    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('isPurchasing: true podczas zakupu, false po zakończeniu', async () => {
    let resolvePurchase!: (val: unknown) => void;
    const Purchases = jest.requireMock('react-native-purchases').default;
    Purchases.purchasePackage.mockImplementationOnce(
      () => new Promise(res => { resolvePurchase = res; }),
    );

    const { result } = renderHook(() => usePayments(), { wrapper });

    let purchasePromise!: Promise<void>;
    act(() => { purchasePromise = result.current.purchase(FAKE_PKG); });

    expect(result.current.isPurchasing).toBe(true);

    await act(async () => {
      resolvePurchase({ customerInfo: { entitlements: { active: {} } } });
      await purchasePromise;
    });

    expect(result.current.isPurchasing).toBe(false);
  });

  it('restore: aktywny entitlement → Alert Sukces', async () => {
    const Purchases = jest.requireMock('react-native-purchases').default;
    Purchases.restorePurchases.mockResolvedValueOnce({
      entitlements: { active: { premium: {} } },
    });

    const { result } = renderHook(() => usePayments(), { wrapper });
    await act(async () => { await result.current.restore(); });

    expect(Alert.alert).toHaveBeenCalledWith('Sukces', 'Zakupy zostały przywrócone.');
  });

  it('fetchOfferings: API zwraca null → offerings pozostaje null', async () => {
    const Purchases = jest.requireMock('react-native-purchases').default;
    Purchases.getOfferings.mockResolvedValueOnce({ current: null });

    const { result } = renderHook(() => usePayments(), { wrapper });
    await act(async () => { await result.current.fetchOfferings(); });

    expect(result.current.offerings).toBeNull();
  });
});
