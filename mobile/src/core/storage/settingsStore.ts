import { loadLocalSettings, saveLocalSettings } from './localStorage';
import { GameSettings, DEFAULT_SETTINGS } from './storageTypes';

let current: GameSettings = { ...DEFAULT_SETTINGS };
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<(s: GameSettings) => void>();

function notify() {
  listeners.forEach(fn => fn(current));
}

export function subscribeSettings(fn: (s: GameSettings) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getSettings(): GameSettings {
  return current;
}

export function isSettingsLoaded(): boolean {
  return loaded;
}

export async function loadSettingsOnce(): Promise<void> {
  if (loaded) return;
  if (loadPromise) return loadPromise;
  loadPromise = loadLocalSettings().then(stored => {
    current = stored;
    loaded = true;
    notify();
  });
  return loadPromise;
}

export async function updateSettings(updates: Partial<GameSettings>): Promise<void> {
  current = { ...current, ...updates };
  notify();
  await saveLocalSettings(current);
}
