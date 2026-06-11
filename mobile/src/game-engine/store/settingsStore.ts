import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SettingsStore<T extends object> {
  subscribe: (fn: (settings: T) => void) => () => void;
  get: () => T;
  isLoaded: () => boolean;
  load: () => Promise<void>;
  update: (updates: Partial<T>) => Promise<void>;
}

/**
 * Creates a type-safe, pub/sub settings store backed by AsyncStorage.
 *
 * Usage per game:
 *   const store = createSettingsStore(DEFAULT_SETTINGS, 'myGame_settings');
 *   export const useSettings = createUseSettings(store);
 */
export function createSettingsStore<T extends object>(
  defaultSettings: T,
  storageKey: string,
): SettingsStore<T> {
  let current: T = { ...defaultSettings };
  let loaded = false;
  let loadPromise: Promise<void> | null = null;
  const listeners = new Set<(s: T) => void>();

  function notify() {
    listeners.forEach(fn => fn(current));
  }

  return {
    subscribe(fn) {
      listeners.add(fn);
      return () => { listeners.delete(fn); };
    },
    get() {
      return current;
    },
    isLoaded() {
      return loaded;
    },
    load() {
      if (loaded) return Promise.resolve();
      if (loadPromise) return loadPromise;
      loadPromise = AsyncStorage.getItem(storageKey).then(raw => {
        current = raw
          ? { ...defaultSettings, ...(JSON.parse(raw) as Partial<T>) }
          : { ...defaultSettings };
        loaded = true;
        notify();
      });
      return loadPromise;
    },
    async update(updates) {
      current = { ...current, ...updates };
      notify();
      await AsyncStorage.setItem(storageKey, JSON.stringify(current));
    },
  };
}
