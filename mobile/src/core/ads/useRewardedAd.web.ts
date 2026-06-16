interface Reward {
  type: string;
  amount: number;
}

interface UseRewardedAdReturn {
  isLoaded: boolean;
  show: (onRewarded: (reward: Reward) => void) => void;
  error: Error | null;
}

export function useRewardedAd(): UseRewardedAdReturn {
  return { isLoaded: false, show: () => {}, error: null };
}
