/**
 * Testy integracyjne: flow zakupu
 *
 * Sprawdzają współpracę PaymentsProvider ↔ usePayments ↔ AdsProvider:
 *  - listener RevenueCat aktualizuje isPremium w kontekście
 *  - purchase uruchamia zakup → listener → isPremium = true
 *  - restore z aktywnym entitlementem → isPremium = true
 *  - isPremium = true propaguje do AdsProvider → canShowAds = false
 */
import React from 'react';
import { render, renderHook, act } from '@testing-library/react-native';
import { Text, Alert } from 'react-native';
import { PaymentsProvider, usePaymentsContext } from '../PaymentsProvider';
import { usePayments } from '../usePayments';
import { AdsContext, useAdsContext } from '../../ads/AdsProvider';

// ── Mocki ─────────────────────────────────────────────────────────────────────

jest.mock('../../../config/env', () => ({
  env: {
    firebase: {},
    admob: {},
    revenuecat: { apiKeyIos: 'test-key', apiKeyAndroid: 'test-key' },
  },
}));

let capturedListener: ((info: { entitlements: { active: Record<string, unknown> } }) => void) | null = null;

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    setLogLevel: jest.fn(),
    configure: jest.fn(),
    getCustomerInfo: jest.fn().mockResolvedValue({ entitlements: { active: {} } }),
    addCustomerInfoUpdateListener: jest.fn((fn) => { capturedListener = fn; }),
    getOfferings: jest.fn().mockResolvedValue({ current: null }),
    purchasePackage: jest.fn().mockResolvedValue({ customerInfo: { entitlements: { active: {} } } }),
    restorePurchases: jest.fn().mockResolvedValue({ entitlements: { active: {} } }),
  },
  LOG_LEVEL: { WARN: 'WARN' },
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

// ── Helpery ───────────────────────────────────────────────────────────────────

const FAKE_PKG = {
  identifier: '$rc_monthly',
  product: { title: 'Premium', priceString: '9,99 zł', description: '' },
};

function paymentsWrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(PaymentsProvider, null, children);
}

/** Komponent pokazujący stan z obu kontekstów jednocześnie */
function FullStackConsumer() {
  const { isPremium, isLoading } = usePaymentsContext();
  const { canShowAds } = useAdsContext();
  return (
    <>
      <Text testID="premium">{String(isPremium)}</Text>
      <Text testID="loading">{String(isLoading)}</Text>
      <Text testID="can-show-ads">{String(canShowAds)}</Text>
    </>
  );
}

// ── Testy ─────────────────────────────────────────────────────────────────────

describe('Flow zakupu — integracja', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedListener = null;
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('listener RevenueCat aktualizuje isPremium w kontekście', async () => {
    const { getByTestId } = render(
      <PaymentsProvider><FullStackConsumer /></PaymentsProvider>,
    );

    // Poczekaj na inicjalizację (getCustomerInfo)
    await act(async () => {});

    expect(getByTestId('premium').props.children).toBe('false');

    // Symuluj wywołanie listenera przez RevenueCat (np. po zakupie w innym miejscu)
    await act(async () => {
      capturedListener?.({ entitlements: { active: { premium: {} } } });
    });

    expect(getByTestId('premium').props.children).toBe('true');
  });

  it('purchase zakończony sukcesem → listener → isPremium = true', async () => {
    const Purchases = jest.requireMock('react-native-purchases').default;
    Purchases.purchasePackage.mockResolvedValueOnce({
      customerInfo: { entitlements: { active: { premium: {} } } },
    });

    const { result } = renderHook(() => usePayments(), { wrapper: paymentsWrapper });

    await act(async () => {});
    expect(result.current.isPremium).toBe(false);

    // Zakup + symulacja listenera (RevenueCat uruchamia go automatycznie po zakupie)
    await act(async () => {
      await result.current.purchase(FAKE_PKG);
      capturedListener?.({ entitlements: { active: { premium: {} } } });
    });

    expect(result.current.isPremium).toBe(true);
  });

  it('restore z aktywnym entitlementem → listener → isPremium = true', async () => {
    const Purchases = jest.requireMock('react-native-purchases').default;
    Purchases.restorePurchases.mockResolvedValueOnce({
      entitlements: { active: { premium: {} } },
    });

    const { result } = renderHook(() => usePayments(), { wrapper: paymentsWrapper });

    await act(async () => {});

    await act(async () => {
      await result.current.restore();
      capturedListener?.({ entitlements: { active: { premium: {} } } });
    });

    expect(result.current.isPremium).toBe(true);
    expect(Alert.alert).toHaveBeenCalledWith('Sukces', 'Zakupy zostały przywrócone.');
  });

  it('isPremium = true propaguje do AdsProvider → canShowAds = false', async () => {
    // Symuluje AdsProviderBridge z _layout.tsx, ale przez bezpośredni AdsContext.Provider
    // (AdsProvider.initializeAds() nie kończy się w jest-expo przez dynamic import —
    // testujemy reaktywność kontekstu, nie sam init SDK)
    function Bridge({ children }: { children: React.ReactNode }) {
      const { isPremium } = usePaymentsContext();
      return (
        <AdsContext.Provider value={{ adsInitialized: true, canShowAds: !isPremium }}>
          {children}
        </AdsContext.Provider>
      );
    }

    const { getByTestId } = render(
      <PaymentsProvider>
        <Bridge>
          <FullStackConsumer />
        </Bridge>
      </PaymentsProvider>,
    );

    await act(async () => {});
    // Przed aktywacją premium: isPremium=false → canShowAds=true
    expect(getByTestId('can-show-ads').props.children).toBe('true');

    // Listener aktywuje premium
    await act(async () => {
      capturedListener?.({ entitlements: { active: { premium: {} } } });
    });

    // Po aktywacji: isPremium=true → Bridge przekazuje canShowAds=false do AdsContext
    expect(getByTestId('premium').props.children).toBe('true');
    expect(getByTestId('can-show-ads').props.children).toBe('false');
  });

  it('isPurchasing wraca do false niezależnie od wyniku zakupu', async () => {
    const Purchases = jest.requireMock('react-native-purchases').default;
    Purchases.purchasePackage.mockRejectedValueOnce({ userCancelled: false, message: 'Błąd sieci' });

    const { result } = renderHook(() => usePayments(), { wrapper: paymentsWrapper });
    await act(async () => {});

    await act(async () => { await result.current.purchase(FAKE_PKG); });

    expect(result.current.isPurchasing).toBe(false);
  });

  it('isLoading = false po zakończeniu inicjalizacji', async () => {
    const { result } = renderHook(() => usePayments(), { wrapper: paymentsWrapper });

    // Przed inicjalizacją
    expect(result.current.isLoading).toBe(true);

    await act(async () => {});

    expect(result.current.isLoading).toBe(false);
  });
});
