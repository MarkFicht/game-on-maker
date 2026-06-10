import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { usePaymentsContext } from './PaymentsProvider';

interface Package {
  identifier: string;
  product: { title: string; priceString: string; description: string };
}

interface Offering {
  identifier: string;
  availablePackages: Package[];
}

interface UsePaymentsReturn {
  isPremium: boolean;
  isLoading: boolean;
  offerings: Offering | null;
  fetchOfferings: () => Promise<void>;
  purchase: (pkg: Package) => Promise<void>;
  restore: () => Promise<void>;
  isPurchasing: boolean;
  isRestoring: boolean;
}

export function usePayments(): UsePaymentsReturn {
  const { isPremium, isLoading } = usePaymentsContext();
  const [offerings, setOfferings] = useState<Offering | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchOfferings = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Purchases = require('react-native-purchases').default;
      const { current } = await Purchases.getOfferings();
      setOfferings(current as Offering | null);
    } catch {
      // no offerings available (sandbox not configured)
    }
  }, []);

  const purchase = useCallback(async (pkg: Package) => {
    setIsPurchasing(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Purchases = require('react-native-purchases').default;
      await Purchases.purchasePackage(pkg as never);
    } catch (e: unknown) {
      const err = e as { userCancelled?: boolean; message?: string };
      if (!err.userCancelled) {
        Alert.alert('Błąd zakupu', err.message ?? 'Spróbuj ponownie.');
      }
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  const restore = useCallback(async () => {
    setIsRestoring(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Purchases = require('react-native-purchases').default;
      const customerInfo = await Purchases.restorePurchases();
      const { ENTITLEMENT_ID } = require('./paymentsConfig');
      if (customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined) {
        Alert.alert('Sukces', 'Zakupy zostały przywrócone.');
      } else {
        Alert.alert('Brak zakupów', 'Nie znaleziono poprzednich zakupów premium.');
      }
    } catch {
      Alert.alert('Błąd', 'Nie udało się przywrócić zakupów. Sprawdź połączenie.');
    } finally {
      setIsRestoring(false);
    }
  }, []);

  return { isPremium, isLoading, offerings, fetchOfferings, purchase, restore, isPurchasing, isRestoring };
}
