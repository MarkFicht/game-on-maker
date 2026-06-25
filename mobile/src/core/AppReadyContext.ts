import { createContext, useContext } from 'react';

export const AppReadyContext = createContext(false);
export const useAppReady = () => useContext(AppReadyContext);
