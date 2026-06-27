import React, { createContext, useCallback, useContext, useState } from 'react';
import { useFocusEffect } from 'expo-router';

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
  useFocusEffect(
    useCallback(() => {
      setConfig(config);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.title, config.isHome, config.showBack, config.onBack, config.visible]),
  );
}
