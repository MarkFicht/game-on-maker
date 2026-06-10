import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { AuthProvider, useAuthContext } from '../AuthProvider';

jest.mock('../../../config/env', () => ({
  env: {
    firebase: {
      apiKey: 'test', authDomain: 'test', projectId: 'test',
      storageBucket: 'test', messagingSenderId: 'test', appId: 'test',
      webClientId: null,
    },
    admob: { appIdIos: null, appIdAndroid: null, rewardedId: null, interstitialId: null, bannerId: null },
    revenuecat: { apiKeyIos: null, apiKeyAndroid: null },
  },
}));

jest.mock('@react-native-firebase/auth', () => {
  const authInstance = {
    onAuthStateChanged: jest.fn(),
    signInAnonymously: jest.fn(),
    signOut: jest.fn(),
    currentUser: null,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authFn: any = jest.fn(() => authInstance);
  authFn.GoogleAuthProvider = { credential: jest.fn() };
  authFn.AppleAuthProvider = { credential: jest.fn() };
  return { __esModule: true, default: authFn };
});

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    isSignedIn: jest.fn().mockResolvedValue(false),
    signOut: jest.fn(),
  },
}));

function getAuthInstance() {
  const mod = jest.requireMock('@react-native-firebase/auth');
  return mod.default() as {
    onAuthStateChanged: jest.Mock;
    signInAnonymously: jest.Mock;
    signOut: jest.Mock;
    currentUser: null;
  };
}

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(AuthProvider, null, children);

describe('useAuth — anonimowe logowanie', () => {
  beforeEach(() => jest.clearAllMocks());

  it('isLoading jest true przed otrzymaniem odpowiedzi od Firebase', () => {
    getAuthInstance().onAuthStateChanged.mockImplementation(() => () => {});
    const { result } = renderHook(() => useAuthContext(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('loguje anonimowo gdy brak zalogowanego użytkownika', async () => {
    const auth = getAuthInstance();
    auth.signInAnonymously.mockResolvedValue(undefined);
    auth.onAuthStateChanged.mockImplementation((cb: (u: null) => void) => {
      cb(null);
      return () => {};
    });

    const { result } = renderHook(() => useAuthContext(), { wrapper });
    await act(async () => {});

    expect(auth.signInAnonymously).toHaveBeenCalledTimes(1);
  });

  it('ustawia user gdy Firebase zwróci zalogowanego użytkownika', async () => {
    const auth = getAuthInstance();
    const fakeUser = { uid: 'anon-uid-123', isAnonymous: true };
    auth.onAuthStateChanged.mockImplementation((cb: (u: typeof fakeUser) => void) => {
      cb(fakeUser);
      return () => {};
    });

    const { result } = renderHook(() => useAuthContext(), { wrapper });
    await act(async () => {});

    expect(result.current.user?.uid).toBe('anon-uid-123');
    expect(result.current.isLoading).toBe(false);
  });

  it('ustawia error gdy signInAnonymously rzuci wyjątek', async () => {
    const auth = getAuthInstance();
    auth.signInAnonymously.mockRejectedValue(new Error('network error'));
    auth.onAuthStateChanged.mockImplementation((cb: (u: null) => void) => {
      cb(null);
      return () => {};
    });

    const { result } = renderHook(() => useAuthContext(), { wrapper });
    await act(async () => {});

    expect(result.current.error).not.toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
