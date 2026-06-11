import { useState, useEffect, useCallback } from 'react';
import { GameSettings } from '../core/storage/storageTypes';
import {
  subscribeSettings,
  getSettings,
  isSettingsLoaded,
  loadSettingsOnce,
  updateSettings as updateSettingsStore,
} from '../core/storage/settingsStore';

export interface UseSettingsReturn {
  settings: GameSettings;
  loading: boolean;
  updateSettings: (updates: Partial<GameSettings>) => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<GameSettings>(getSettings());
  const [loading, setLoading] = useState(!isSettingsLoaded());

  useEffect(() => {
    const unsubscribe = subscribeSettings(s => {
      setSettings(s);
      setLoading(false);
    });
    loadSettingsOnce();
    return unsubscribe;
  }, []);

  return {
    settings,
    loading,
    updateSettings: useCallback(updateSettingsStore, []),
  };
}
