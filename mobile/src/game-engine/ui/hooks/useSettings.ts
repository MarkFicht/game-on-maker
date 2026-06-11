import { useState, useEffect, useCallback } from 'react';
import type { SettingsStore } from '../../store/settingsStore';

export interface UseSettingsReturn<T extends object> {
  settings: T;
  loading: boolean;
  updateSettings: (updates: Partial<T>) => Promise<void>;
}

/**
 * Factory that creates a useSettings hook bound to a specific settings store.
 *
 * Usage:
 *   const store = createSettingsStore(DEFAULT_SETTINGS, 'myGame_settings');
 *   export const useSettings = createUseSettings(store);
 *
 *   // In component:
 *   const { settings, updateSettings } = useSettings();
 */
export function createUseSettings<T extends object>(
  store: SettingsStore<T>,
): () => UseSettingsReturn<T> {
  return function useSettings(): UseSettingsReturn<T> {
    const [settings, setSettings] = useState<T>(store.get());
    const [loading, setLoading] = useState(!store.isLoaded());

    useEffect(() => {
      const unsubscribe = store.subscribe(s => {
        setSettings(s);
        setLoading(false);
      });
      store.load();
      return unsubscribe;
    // store is a stable module-level singleton — safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateSettings = useCallback(
      (updates: Partial<T>) => store.update(updates),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    return { settings, loading, updateSettings };
  };
}
