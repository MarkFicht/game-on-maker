import React, { createContext, useCallback, useContext, useLayoutEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { unlockNavGuard } from '../navigation/navGuard';

export interface HeaderConfig {
  title?: string;
  /** shows ⚙️ on left → navigates to /settings (home screen only) */
  isHome?: boolean;
  /** shows ← on left via stack navigator */
  showBack?: boolean;
  /** custom back handler — also shows ← if provided */
  onBack?: () => void;
  /** hide the header entirely (e.g. fullscreen gameplay) */
  visible?: boolean;
}

const DEFAULT_CONFIG: HeaderConfig = { title: 'WordRushMF' };

// Split in two so that calling the setter (from useHeaderConfig, inside a
// screen) doesn't re-render that screen itself. A single combined context
// would re-render every consumer — including the screen that just called
// its own setConfig — on every navigation, which measured as a very real
// chain of extra renders adding real, visible delay before the header
// actually updates.
const HeaderConfigValueContext = createContext<HeaderConfig>(DEFAULT_CONFIG);
const HeaderConfigSetterContext = createContext<(config: HeaderConfig) => void>(() => {});

export function HeaderConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<HeaderConfig>(DEFAULT_CONFIG);
  console.log('[PERF] HeaderConfigProvider render', Date.now());
  return (
    <HeaderConfigSetterContext.Provider value={setConfig}>
      <HeaderConfigValueContext.Provider value={config}>
        {children}
      </HeaderConfigValueContext.Provider>
    </HeaderConfigSetterContext.Provider>
  );
}

/** Only `PersistentPageHeader` should call this — it's the only thing that needs to re-render on config change. */
export function usePersistentHeaderConfig(): HeaderConfig {
  return useContext(HeaderConfigValueContext);
}

/**
 * Screens call this to declare what the persistent header should show
 * whenever they're focused. The header component itself is rendered once,
 * at the app root — it never mounts/unmounts on navigation, so it only
 * animates when the title it receives actually changes.
 */
export function useHeaderConfig(config: HeaderConfig): void {
  const setConfig = useContext(HeaderConfigSetterContext);

  // expo-router's useFocusEffect doesn't actually fire until its own
  // useOptionalNavigation() resolves (starts at null, needs an extra
  // effect round-trip) — measured ~150-400ms after this screen's first
  // render, even though the screen's own data (and thus the title it
  // wants to show) was already correct on that first render. That gap
  // was very visible on game.tsx: deck content showing instantly while
  // the header still showed the previous screen's title. useLayoutEffect
  // fires synchronously right after this screen's own first paint, so the
  // header catches up immediately instead of waiting on that hook.
  useLayoutEffect(() => {
    setConfig(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.title, config.isHome, config.showBack, config.onBack, config.visible]);

  useFocusEffect(
    useCallback(() => {
      setConfig(config);
      // This screen is now the focused one — whatever navigation got it
      // here (push or back) is done. Every screen calls useHeaderConfig,
      // so this is the one place that needs to know about it; no per-screen
      // wiring, and it naturally covers both push (fresh mount, redundant
      // with the layout effect above but harmless) and back (refocusing an
      // already-mounted screen, where the layout effect above does *not*
      // re-run) the same way.
      unlockNavGuard();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.title, config.isHome, config.showBack, config.onBack, config.visible]),
  );
}
