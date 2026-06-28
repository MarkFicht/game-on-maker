import React, { createContext, useContext, useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { doSignInAnonymously, doSignOut } from './authHelpers';

interface AuthContextValue {
  user: FirebaseAuthTypes.User | null;
  isLoading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log('[PERF] AuthProvider render', Date.now());

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          setIsLoading(false);
        } else {
          try {
            await doSignInAnonymously();
          } catch {
            setError('Nie można zalogować się. Sprawdź połączenie z internetem.');
            setIsLoading(false);
          }
        }
      });
    } catch {
      // Native Firebase module unavailable (web / Expo Go without dev build)
      setIsLoading(false);
    }
    return () => unsubscribe?.();
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await doSignOut();
    } catch {
      setError('Wylogowanie nie powiodło się.');
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
