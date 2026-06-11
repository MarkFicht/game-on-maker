import { createSettingsStore } from '../../game-engine/store/settingsStore';
import { GameSettings, DEFAULT_SETTINGS } from '../../core/storage/storageTypes';

// WordRush settings store — singleton for this game.
// When building a new game, create a similar file with your own settings type.
export const wordRushSettingsStore = createSettingsStore<GameSettings>(
  DEFAULT_SETTINGS,
  'game_settings', // keep existing key to preserve user settings
);

// Named exports matching the original src/core/storage/settingsStore.ts API
// so existing imports continue to work without changes.
export const subscribeSettings = (fn: (s: GameSettings) => void) =>
  wordRushSettingsStore.subscribe(fn);
export const getSettings = (): GameSettings => wordRushSettingsStore.get();
export const isSettingsLoaded = (): boolean => wordRushSettingsStore.isLoaded();
export const loadSettingsOnce = (): Promise<void> => wordRushSettingsStore.load();
export const updateSettings = (updates: Partial<GameSettings>): Promise<void> =>
  wordRushSettingsStore.update(updates);
