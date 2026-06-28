import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { ENTITLEMENT_ID, getRevenueCatApiKey } from './paymentsConfig';

interface PaymentsContextValue {
  isPremium: boolean;
  isLoading: boolean;
}

const PaymentsContext = createContext<PaymentsContextValue>({
  isPremium: false,
  isLoading: true,
});

interface PaymentsProviderProps {
  children?: React.ReactNode;
}

export function PaymentsProvider({ children }: PaymentsProviderProps) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  console.log('[PERF] PaymentsProvider render', Date.now());

  useEffect(() => {
    initializePurchases(setIsPremium, setIsLoading);
  }, []);

  return (
    <PaymentsContext.Provider value={{ isPremium, isLoading }}>
      {children}
    </PaymentsContext.Provider>
  );
}

export function usePaymentsContext(): PaymentsContextValue {
  return useContext(PaymentsContext);
}

async function initializePurchases(
  setIsPremium: (v: boolean) => void,
  setIsLoading: (v: boolean) => void,
): Promise<void> {
  if (Platform.OS === 'web') {
    setIsLoading(false);
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: Purchases, LOG_LEVEL } = require('react-native-purchases');

    const apiKey = getRevenueCatApiKey();
    if (!apiKey) {
      setIsLoading(false);
      return;
    }

    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.WARN);
    Purchases.configure({ apiKey });

    const customerInfo = await Purchases.getCustomerInfo();
    setIsPremium(customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined);
    setIsLoading(false);

    Purchases.addCustomerInfoUpdateListener((info: { entitlements: { active: Record<string, unknown> } }) => {
      setIsPremium(info.entitlements.active[ENTITLEMENT_ID] !== undefined);
    });
  } catch {
    setIsLoading(false);
  }
}
