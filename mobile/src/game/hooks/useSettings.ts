import { createUseSettings } from '../../game-engine/ui/hooks/useSettings';
import type { UseSettingsReturn as GenericReturn } from '../../game-engine/ui/hooks/useSettings';
import type { GameSettings } from '../../core/storage/storageTypes';
import { wordRushSettingsStore } from '../store/settingsStore';

// Concrete type alias for backward compat (was a named interface in the old src/hooks/useSettings.ts)
export type UseSettingsReturn = GenericReturn<GameSettings>;

export const useSettings = createUseSettings<GameSettings>(wordRushSettingsStore);
