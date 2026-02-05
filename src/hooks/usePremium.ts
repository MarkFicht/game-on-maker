// Hook for premium status and billing
import { useState, useEffect, useCallback } from 'react';
import { getBillingService, type Product, type ProductId } from '@/services/billing';
import { usePremiumContext } from '@/App';

export interface UsePremiumReturn {
  status: ReturnType<typeof usePremiumContext>['premiumStatus'];
  products: Product[];
  loading: boolean;
  purchasing: boolean;
  purchase: (productId: ProductId) => Promise<boolean>;
  restore: () => Promise<void>;
  refresh: () => Promise<void>;
}

const billing = getBillingService();

export function usePremium(): UsePremiumReturn {
  const { premiumStatus, premiumLoading, refreshStatus } = usePremiumContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [purchasing, setPurchasing] = useState(false);
  
  useEffect(() => {
    billing.getProducts().then(setProducts).catch(
      (e) => console.error('[usePremium] Failed to load products:', e)
    );
  }, []);
  
  const purchase = useCallback(async (productId: ProductId): Promise<boolean> => {
    setPurchasing(true);
    try {
      const result = await billing.purchase(productId);
      if (result.success) await refreshStatus();
      return result.success;
    } catch (error) {
      console.error('[usePremium] Purchase failed:', error);
      return false;
    } finally {
      setPurchasing(false);
    }
  }, [refreshStatus]);
  
  const restore = useCallback(async () => {
    try {
      await billing.restorePurchases();
      await refreshStatus();
    } catch (error) {
      console.error('[usePremium] Restore failed:', error);
    }
  }, [refreshStatus]);
  
  return {
    status: premiumStatus,
    products,
    loading: premiumLoading,
    purchasing,
    purchase,
    restore,
    refresh: refreshStatus,
  };
}
