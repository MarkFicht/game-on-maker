// Hook for premium status and billing
import { useState, useEffect, useCallback } from 'react';
import { getBillingService, type PremiumStatus, type Product, type ProductId } from '@/services/billing';

export interface UsePremiumReturn {
  status: PremiumStatus;
  products: Product[];
  loading: boolean;
  purchasing: boolean;
  purchase: (productId: ProductId) => Promise<boolean>;
  restore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePremium(): UsePremiumReturn {
  const [status, setStatus] = useState<PremiumStatus>({
    isActive: false,
    hasRemoveAds: false,
    hasPremiumDecks: false,
    source: 'mock',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  
  const billing = getBillingService();
  
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await billing.initialize();
      const [premiumStatus, productList] = await Promise.all([
        billing.getPremiumStatus(),
        billing.getProducts(),
      ]);
      setStatus(premiumStatus);
      setProducts(productList);
    } catch (error) {
      console.error('[usePremium] Failed to load:', error);
    } finally {
      setLoading(false);
    }
  }, [billing]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const purchase = useCallback(async (productId: ProductId): Promise<boolean> => {
    setPurchasing(true);
    try {
      const result = await billing.purchase(productId);
      if (result.success) {
        const newStatus = await billing.getPremiumStatus();
        setStatus(newStatus);
      }
      return result.success;
    } catch (error) {
      console.error('[usePremium] Purchase failed:', error);
      return false;
    } finally {
      setPurchasing(false);
    }
  }, [billing]);
  
  const restore = useCallback(async () => {
    setLoading(true);
    try {
      const restoredStatus = await billing.restorePurchases();
      setStatus(restoredStatus);
    } catch (error) {
      console.error('[usePremium] Restore failed:', error);
    } finally {
      setLoading(false);
    }
  }, [billing]);
  
  return {
    status,
    products,
    loading,
    purchasing,
    purchase,
    restore,
    refresh: loadData,
  };
}

// Helper function to create simple status check hooks
const createStatusHook = (key: keyof PremiumStatus) => () => {
  const { status } = usePremium();
  return status[key] as boolean;
};

// Simple check hooks
export const useHasPremium = createStatusHook('isActive');
export const useHasRemoveAds = createStatusHook('hasRemoveAds');
export const useHasPremiumDecks = createStatusHook('hasPremiumDecks');
