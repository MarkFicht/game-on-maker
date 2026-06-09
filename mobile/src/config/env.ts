const REQUIRED_VARS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;

const OPTIONAL_VARS = [
  'EXPO_PUBLIC_ADMOB_APP_ID_IOS',
  'EXPO_PUBLIC_ADMOB_APP_ID_ANDROID',
  'EXPO_PUBLIC_ADMOB_REWARDED_ID',
  'EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID',
  'EXPO_PUBLIC_ADMOB_BANNER_ID',
  'EXPO_PUBLIC_REVENUECAT_API_KEY_IOS',
  'EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID',
] as const;

type RequiredVar = (typeof REQUIRED_VARS)[number];
type OptionalVar = (typeof OPTIONAL_VARS)[number];

export function validateEnv(): void {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nCopy .env.example to .env and fill in the values.`,
    );
  }
}

function getRequired(key: RequiredVar): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

function getOptional(key: OptionalVar): string | undefined {
  return process.env[key] || undefined;
}

export const env = {
  firebase: {
    apiKey: getRequired('EXPO_PUBLIC_FIREBASE_API_KEY'),
    authDomain: getRequired('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: getRequired('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: getRequired('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getRequired('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getRequired('EXPO_PUBLIC_FIREBASE_APP_ID'),
  },
  admob: {
    appIdIos: getOptional('EXPO_PUBLIC_ADMOB_APP_ID_IOS'),
    appIdAndroid: getOptional('EXPO_PUBLIC_ADMOB_APP_ID_ANDROID'),
    rewardedId: getOptional('EXPO_PUBLIC_ADMOB_REWARDED_ID'),
    interstitialId: getOptional('EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID'),
    bannerId: getOptional('EXPO_PUBLIC_ADMOB_BANNER_ID'),
  },
  revenuecat: {
    apiKeyIos: getOptional('EXPO_PUBLIC_REVENUECAT_API_KEY_IOS'),
    apiKeyAndroid: getOptional('EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID'),
  },
} as const;
