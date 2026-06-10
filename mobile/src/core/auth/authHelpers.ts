import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { env } from '../../config/env';

if (env.firebase.webClientId) {
  GoogleSignin.configure({ webClientId: env.firebase.webClientId });
}

export async function doSignInAnonymously(): Promise<void> {
  await auth().signInAnonymously();
}

export async function doSignInWithGoogle(): Promise<void> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const signInResult = await GoogleSignin.signIn();
  const idToken = signInResult.data?.idToken ?? null;
  if (!idToken) throw new Error('Google Sign-In nie zwróciło idToken.');
  const credential = auth.GoogleAuthProvider.credential(idToken);
  await auth().signInWithCredential(credential);
}

export async function doSignInWithApple(): Promise<void> {
  if (Platform.OS !== 'ios') throw new Error('Apple Sign-In dostępny tylko na iOS.');
  const appleCredential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  if (!appleCredential.identityToken) {
    throw new Error('Apple Sign-In nie zwróciło identityToken.');
  }
  const credential = auth.AppleAuthProvider.credential(appleCredential.identityToken);
  await auth().signInWithCredential(credential);
}

export async function doSignOut(): Promise<void> {
  try {
    // GoogleSignin.isSignedIn might not exist on all versions, use hasPlayServices as fallback
    await GoogleSignin.signOut();
  } catch {
    // Not signed in with Google or error — continue
  }
  await auth().signOut();
}

export async function linkAnonymousWithGoogle(): Promise<void> {
  const currentUser = auth().currentUser;
  if (!currentUser?.isAnonymous) {
    throw new Error('Konto nie jest anonimowe — nie można połączyć.');
  }
  await GoogleSignin.hasPlayServices();
  const signInResult = await GoogleSignin.signIn();
  const idToken = signInResult.data?.idToken ?? null;
  if (!idToken) throw new Error('Google Sign-In nie zwróciło idToken.');
  const credential = auth.GoogleAuthProvider.credential(idToken);
  await currentUser.linkWithCredential(credential);
}
