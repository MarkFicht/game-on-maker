// Settings store moved to src/game/store/settingsStore.ts.
// This file re-exports for backward compatibility — existing imports continue to work.
export {
  subscribeSettings,
  getSettings,
  isSettingsLoaded,
  loadSettingsOnce,
  updateSettings,
} from '../../game/store/settingsStore';
