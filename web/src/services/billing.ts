// Billing Service - Stub for IAP/subscription management
// In production, this would wrap RevenueCat or native IAP

export type ProductId = 'remove_ads' | 'premium_decks' | 'premium_bundle';

export interface Product {
  id: ProductId;
  name: string;
  description: string;
  price: string;
  priceValue: number;
  type: 'one_time' | 'subscription';
}

export interface PurchaseResult {
  success: boolean;
  productId?: ProductId;
  error?: string;
}

export interface PremiumStatus {
  isActive: boolean;
  hasRemoveAds: boolean;
  hasPremiumDecks: boolean;
  expiresAt?: Date;
  source: 'purchase' | 'restored' | 'mock';
}

export interface BillingService {
  initialize(): Promise<void>;
  getProducts(): Promise<Product[]>;
  purchase(productId: ProductId): Promise<PurchaseResult>;
  restorePurchases(): Promise<PremiumStatus>;
  getPremiumStatus(): Promise<PremiumStatus>;
}

// Mock products
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'remove_ads',
    name: 'Remove Ads',
    description: 'Enjoy the game without any advertisements',
    price: '$2.99',
    priceValue: 2.99,
    type: 'one_time',
  },
  {
    id: 'premium_decks',
    name: 'Premium Decks',
    description: 'Unlock all premium word decks',
    price: '$4.99',
    priceValue: 4.99,
    type: 'one_time',
  },
  {
    id: 'premium_bundle',
    name: 'Premium Bundle',
    description: 'Remove ads + all premium decks',
    price: '$5.99',
    priceValue: 5.99,
    type: 'one_time',
  },
];

const DEFAULT_STATUS: PremiumStatus = {
  isActive: false,
  hasRemoveAds: false,
  hasPremiumDecks: false,
  source: 'mock',
};

// Local storage key for mock purchases
const PREMIUM_STORAGE_KEY = 'wordgame_premium_status';

class MockBillingService implements BillingService {
  private status: PremiumStatus = DEFAULT_STATUS;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    console.log('[Billing] Initializing mock service...');
    
    // Load from localStorage
    try {
      const stored = localStorage.getItem(PREMIUM_STORAGE_KEY);
      if (stored) {
        this.status = JSON.parse(stored);
        console.log('[Billing] Loaded premium status:', this.status);
      }
    } catch {
      console.log('[Billing] No stored premium status');
    }
    
    this.initialized = true;
    console.log('[Billing] Mock service ready');
  }

  async getProducts(): Promise<Product[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PRODUCTS;
  }

  async purchase(productId: ProductId): Promise<PurchaseResult> {
    console.log(`[Billing] Processing purchase: ${productId}`);
    
    // Simulate purchase flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update status based on product
    const newStatus: PremiumStatus = { ...this.status };
    newStatus.isActive = true;
    newStatus.source = 'purchase';
    
    switch (productId) {
      case 'remove_ads':
        newStatus.hasRemoveAds = true;
        break;
      case 'premium_decks':
        newStatus.hasPremiumDecks = true;
        break;
      case 'premium_bundle':
        newStatus.hasRemoveAds = true;
        newStatus.hasPremiumDecks = true;
        break;
    }
    
    this.status = newStatus;
    this.saveStatus();
    
    console.log('[Billing] Purchase successful:', productId);
    return { success: true, productId };
  }

  async restorePurchases(): Promise<PremiumStatus> {
    console.log('[Billing] Restoring purchases...');
    
    // Simulate restore
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In mock mode, just return current status
    if (this.status.isActive) {
      this.status.source = 'restored';
      console.log('[Billing] Purchases restored:', this.status);
    } else {
      console.log('[Billing] No purchases to restore');
    }
    
    return this.status;
  }

  async getPremiumStatus(): Promise<PremiumStatus> {
    return this.status;
  }

  private saveStatus(): void {
    try {
      localStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(this.status));
    } catch {
      console.error('[Billing] Failed to save premium status');
    }
  }

  // Dev helper: reset all purchases
  resetPurchases(): void {
    this.status = DEFAULT_STATUS;
    localStorage.removeItem(PREMIUM_STORAGE_KEY);
    console.log('[Billing] All purchases reset');
  }
}

// Singleton
let billingInstance: MockBillingService | null = null;

export function getBillingService(): BillingService {
  if (!billingInstance) {
    billingInstance = new MockBillingService();
  }
  return billingInstance;
}

export function resetBillingService(): void {
  if (billingInstance) {
    billingInstance.resetPurchases();
  }
  billingInstance = null;
}

// Helper hooks data
export async function checkPremiumAccess(feature: 'ads' | 'decks'): Promise<boolean> {
  const service = getBillingService();
  await service.initialize();
  const status = await service.getPremiumStatus();
  
  if (feature === 'ads') {
    return status.hasRemoveAds;
  }
  return status.hasPremiumDecks;
}
