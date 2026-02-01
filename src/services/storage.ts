// Storage Service - Abstraction for persistent storage
// Works with localStorage in browser, can be adapted for AsyncStorage in RN

const STORAGE_PREFIX = 'wordgame_';

export interface StorageService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

class LocalStorageService implements StorageService {
  private getKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : null;
    } catch {
      console.error(`[Storage] Error reading ${key}`);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch {
      console.error(`[Storage] Error writing ${key}`);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch {
      console.error(`[Storage] Error removing ${key}`);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
      keys.forEach(k => localStorage.removeItem(k));
    } catch {
      console.error('[Storage] Error clearing');
    }
  }
}

// Storage keys
export const STORAGE_KEYS = {
  SETTINGS: 'settings',
  PREMIUM_STATUS: 'premium_status',
  GAME_STATS: 'game_stats',
  CONSENT_GIVEN: 'consent_given',
  LAST_PLAYED_DECK: 'last_played_deck',
} as const;

// Singleton
export const storage = new LocalStorageService();

// Settings interface
export interface AppSettings {
  roundDuration: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'dark' | 'light' | 'system';
}

export const DEFAULT_SETTINGS: AppSettings = {
  roundDuration: 60,
  soundEnabled: true,
  vibrationEnabled: true,
  theme: 'dark',
};

// Helper functions
export async function getSettings(): Promise<AppSettings> {
  const settings = await storage.get<AppSettings>(STORAGE_KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...settings };
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  await storage.set(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
}

// Stats
export interface LifetimeStats {
  gamesPlayed: number;
  wordsGuessed: number;
  bestScore: number;
  totalPlayTime: number;
}

export async function getLifetimeStats(): Promise<LifetimeStats> {
  const stats = await storage.get<LifetimeStats>(STORAGE_KEYS.GAME_STATS);
  return stats || {
    gamesPlayed: 0,
    wordsGuessed: 0,
    bestScore: 0,
    totalPlayTime: 0,
  };
}

export async function updateLifetimeStats(roundStats: {
  wordsGuessed: number;
  playTime: number;
}): Promise<void> {
  const current = await getLifetimeStats();
  await storage.set(STORAGE_KEYS.GAME_STATS, {
    gamesPlayed: current.gamesPlayed + 1,
    wordsGuessed: current.wordsGuessed + roundStats.wordsGuessed,
    bestScore: Math.max(current.bestScore, roundStats.wordsGuessed),
    totalPlayTime: current.totalPlayTime + roundStats.playTime,
  });
}
