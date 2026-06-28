// Expo Router handles navigation via the app/ directory (file-based routing).
// Route types are auto-generated in .expo/types/router.d.ts when typedRoutes is enabled.
import { router as expoRouter } from 'expo-router';
import { isNavGuarded, lockNavGuard } from './navGuard';

export type AppRoute = '/' | '/game' | '/settings' | '/store';

// Drop-in replacement for `import { router } from 'expo-router'` — same
// shape, but push/replace/back check isNavGuarded() synchronously, before
// React (or expo-router itself) does anything: the *first* call locks the
// gate and proceeds, any further call within the lock window is simply
// dropped.
export const router = {
  ...expoRouter,
  push: ((...args: Parameters<typeof expoRouter.push>) => {
    if (isNavGuarded()) return;
    lockNavGuard();
    return expoRouter.push(...args);
  }) as typeof expoRouter.push,
  replace: ((...args: Parameters<typeof expoRouter.replace>) => {
    if (isNavGuarded()) return;
    lockNavGuard();
    return expoRouter.replace(...args);
  }) as typeof expoRouter.replace,
  back: () => {
    if (isNavGuarded()) return;
    lockNavGuard();
    expoRouter.back();
  },
};
