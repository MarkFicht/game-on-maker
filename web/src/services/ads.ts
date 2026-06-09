// Ads Service - Stub for ad integration
// In production, this would wrap react-native-google-mobile-ads or web ad SDKs

export type AdType = 'rewarded' | 'interstitial' | 'banner';

export interface AdConfig {
  enabled: boolean;
  testMode: boolean;
  interstitialFrequency: number; // show interstitial every N rounds
  rewardedAdUnits: {
    extraTime: string;
    skipWord: string;
  };
  interstitialAdUnit: string;
  bannerAdUnit: string;
}

export interface AdService {
  isLoaded(type: AdType): boolean;
  loadAd(type: AdType): Promise<void>;
  showRewarded(placement: string): Promise<{ rewarded: boolean }>;
  showInterstitial(): Promise<void>;
  shouldShowInterstitial(roundNumber: number): boolean;
}

// Default config - in production, load from env/config
const DEFAULT_AD_CONFIG: AdConfig = {
  enabled: false, // Disabled in dev by default
  testMode: true,
  interstitialFrequency: 3,
  rewardedAdUnits: {
    extraTime: 'ca-app-pub-xxx/extra-time',
    skipWord: 'ca-app-pub-xxx/skip-word',
  },
  interstitialAdUnit: 'ca-app-pub-xxx/interstitial',
  bannerAdUnit: 'ca-app-pub-xxx/banner',
};

class MockAdService implements AdService {
  private config: AdConfig;
  private loadedAds: Set<AdType> = new Set();

  constructor(config: AdConfig = DEFAULT_AD_CONFIG) {
    this.config = config;
    console.log('[Ads] Mock service initialized', { enabled: config.enabled });
  }

  isLoaded(type: AdType): boolean {
    return this.loadedAds.has(type);
  }

  async loadAd(type: AdType): Promise<void> {
    if (!this.config.enabled) {
      console.log(`[Ads] Skipped loading ${type} - ads disabled`);
      return;
    }

    // Simulate load delay
    await new Promise(resolve => setTimeout(resolve, 500));
    this.loadedAds.add(type);
    console.log(`[Ads] ${type} ad loaded (mock)`);
  }

  async showRewarded(placement: string): Promise<{ rewarded: boolean }> {
    if (!this.config.enabled) {
      console.log(`[Ads] Rewarded skipped (disabled) - placement: ${placement}`);
      // In dev mode, auto-grant reward
      return { rewarded: true };
    }

    console.log(`[Ads] Showing rewarded ad for: ${placement}`);
    // Simulate watching ad
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.loadedAds.delete('rewarded');
    
    // Mock: 90% chance of reward
    const rewarded = Math.random() > 0.1;
    console.log(`[Ads] Rewarded result: ${rewarded}`);
    return { rewarded };
  }

  async showInterstitial(): Promise<void> {
    if (!this.config.enabled) {
      console.log('[Ads] Interstitial skipped (disabled)');
      return;
    }

    console.log('[Ads] Showing interstitial');
    await new Promise(resolve => setTimeout(resolve, 500));
    this.loadedAds.delete('interstitial');
  }

  shouldShowInterstitial(roundNumber: number): boolean {
    if (!this.config.enabled) return false;
    return roundNumber > 0 && roundNumber % this.config.interstitialFrequency === 0;
  }
}

// Feature flag to enable/disable ads globally
let adsEnabled = false;

export function setAdsEnabled(enabled: boolean): void {
  adsEnabled = enabled;
  console.log(`[Ads] Feature flag set to: ${enabled}`);
}

export function getAdsEnabled(): boolean {
  return adsEnabled;
}

// Singleton
let adServiceInstance: AdService | null = null;

export function getAdService(): AdService {
  if (!adServiceInstance) {
    adServiceInstance = new MockAdService({
      ...DEFAULT_AD_CONFIG,
      enabled: adsEnabled,
    });
  }
  return adServiceInstance;
}

export function resetAdService(): void {
  adServiceInstance = null;
}

// Preload ads
export async function preloadAds(): Promise<void> {
  const service = getAdService();
  await Promise.all([
    service.loadAd('rewarded'),
    service.loadAd('interstitial'),
  ]);
}
