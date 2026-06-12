import { createSettingsStore } from '../../game-engine/store/settingsStore';
import { GameSettings, DEFAULT_SETTINGS } from '../../core/storage/storageTypes';

export const wordRushSettingsStore = createSettingsStore<GameSettings>(
  DEFAULT_SETTINGS,
  'game_settings',
);
