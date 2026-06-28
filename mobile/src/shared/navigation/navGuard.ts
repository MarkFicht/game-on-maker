import { Platform } from 'react-native';

// Module-level, not React state — the check has to be synchronous at the
// moment router.push/replace/back is *called*, before React gets a chance
// to re-render anything.
//
// unlockNavGuard() is called from useHeaderConfig once the destination
// screen actually focuses — but that can fire well under MIN_LOCK_MS after
// the tap (measured ~650-700ms for a heavier screen like Decks is still
// slow enough to *feel* unresponsive, so a second real tap after the
// screen has technically already focused is common, not just mashing).
// minLockedUntil enforces a floor so a same-feeling-slow second tap still
// gets dropped even though the destination already focused.
let navigating = false;
let minLockedUntil = 0;
let safetyTimer: ReturnType<typeof setTimeout> | null = null;
let minLockTimer: ReturnType<typeof setTimeout> | null = null;

// Measured via logcat on Android: Decks takes ~660-770ms to render+mount+
// focus (was ~700-815ms before combining DeckCard's tint+depth images into
// one) — set comfortably above that observed mount time. Web mounts a new
// screen near-instantly, so this floor would only ever add an artificial
// wait there for no benefit — keep it native-only.
const MIN_LOCK_MS = Platform.OS === 'web' ? 0 : 800;
// Backstop only, in case a future screen never calls useHeaderConfig (and
// so never unlocks) — generous on purpose, should never normally fire.
const SAFETY_UNLOCK_MS = 3000;

/** True if a navigation is already in flight — callers should no-op. */
export function isNavGuarded(): boolean {
  return navigating;
}

export function lockNavGuard(): void {
  navigating = true;
  minLockedUntil = Date.now() + MIN_LOCK_MS;
  if (safetyTimer) clearTimeout(safetyTimer);
  if (minLockTimer) clearTimeout(minLockTimer);
  safetyTimer = setTimeout(() => { navigating = false; }, SAFETY_UNLOCK_MS);
}

export function unlockNavGuard(): void {
  const remaining = minLockedUntil - Date.now();
  if (remaining > 0) {
    if (minLockTimer) clearTimeout(minLockTimer);
    minLockTimer = setTimeout(() => { navigating = false; }, remaining);
    return;
  }
  navigating = false;
  if (safetyTimer) clearTimeout(safetyTimer);
}
