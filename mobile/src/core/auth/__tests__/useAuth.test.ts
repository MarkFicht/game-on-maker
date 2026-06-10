import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { AuthProvider, useAuthContext } from '../AuthProvider';

const mockOnAuthStateChanged = jest.fn();
const mockSignInAnonymously = jest.fn();
const mockSignOut = jest.fn();
const mockIsSignedIn = jest.fn().mockResolvedValue(false);

jest.mock('@react-native-firebase/auth', () => {
  const authInstance = {
    onAuthStateChanged: mockOnAuthStateChanged,
    signInAnonymously: mockSignInAnonymously,
    signOut: mockSignOut,
    currentUser: null,
  };
  const authFn = () => authInstance;
  authFn.GoogleAuthProvider = { credential: jest.fn() };
  authFn.AppleAuthProvider = { credential: jest.fn() };
  return { __esModule: true, default: authFn };
});

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: { isSignedIn: mockIsSignedIn, signOut: jest.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(AuthProvider, null, children);

describe('useAuth — anonimowe logowanie', () => {
  beforeEach(() => jest.clearAllMocks());

  it('isLoading jest true przed otrzymaniem odpowiedzi od Firebase', () => {
    mockOnAuthStateChanged.mockImplementation(() => () => {});
    const { result } = renderHook(() => useAuthContext(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('loguje anonimowo gdy brak zalogowanego użytkownika', async () => {
    mockSignInAnonymously.mockResolvedValue(undefined);
    mockOnAuthStateChanged.mockImplementation((cb: (u: null) => void) => {
      cb(null);
      return () => {};
    });

    await act(async () => {
      renderHook(() => useAuthContext(), { wrapper });
    });

    expect(mockSignInAnonymously).toHaveBeenCalledTimes(1);
  });

  it('ustawia user gdy Firebase zwróci zalogowanego użytkownika', async () => {
    const fakeUser = { uid: 'anon-uid-123', isAnonymous: true };
    mockOnAuthStateChanged.mockImplementation((cb: (u: typeof fakeUser) => void) => {
      cb(fakeUser);
      return () => {};
    });

    const { result } = await act(async () =>
      renderHook(() => useAuthContext(), { wrapper }),
    );

    expect(result.current.user?.uid).toBe('anon-uid-123');
    expect(result.current.isLoading).toBe(false);
  });

  it('ustawia error gdy signInAnonymously rzuci wyjątek', async () => {
    mockSignInAnonymously.mockRejectedValue(new Error('network error'));
    mockOnAuthStateChanged.mockImplementation((cb: (u: null) => void) => {
      cb(null);
      return () => {};
    });

    const { result } = await act(async () =>
      renderHook(() => useAuthContext(), { wrapper }),
    );

    expect(result.current.error).not.toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
