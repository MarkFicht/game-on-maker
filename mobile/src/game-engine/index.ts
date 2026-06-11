// game-engine — reusable infrastructure for all games built on this boilerplate.
//
// To build a new game:
//   1. Replace src/game/ with your game logic (engine, types, decks, components, hooks)
//   2. Create src/game/store/settingsStore.ts using createSettingsStore()
//   3. Create src/game/hooks/useSettings.ts using createUseSettings()
//   4. Import UI from here — theme, Button, PageHeader, GradientBackground, MuteButton
//   5. core/ (auth, ads, payments) stays unchanged
export * from './ui';
export { createSettingsStore } from './store/settingsStore';
export type { SettingsStore } from './store/settingsStore';
