// Hook for settings persistence
import { useState, useEffect, useCallback } from 'react';
import { getSettings, saveSettings, type AppSettings, DEFAULT_SETTINGS } from '@/services/storage';

export interface UseSettingsReturn {
  settings: AppSettings;
  loading: boolean;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const load = async () => {
      const stored = await getSettings();
      setSettings(stored);
      setLoading(false);
    };
    load();
  }, []);
  
  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveSettings(updates);
  }, [settings]);
  
  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    await saveSettings(DEFAULT_SETTINGS);
  }, []);
  
  return {
    settings,
    loading,
    updateSettings,
    resetSettings,
  };
}
