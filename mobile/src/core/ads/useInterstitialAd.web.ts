interface UseInterstitialAdReturn {
  isLoaded: boolean;
  show: () => void;
  error: Error | null;
}

export function useInterstitialAd(): UseInterstitialAdReturn {
  return { isLoaded: false, show: () => {}, error: null };
}
