// Expo only inlines EXPO_PUBLIC_* vars for static `process.env.NAME` dot-notation
// access — `process.env[name]` (computed access) is invisible to the inliner and
// always evaluates to undefined in production/standalone builds (works only by
// accident in `expo start` dev mode, where the Metro dev server ships a live
// process.env). Every reference below must stay static.

export function validateEnv(): void {
  const required: Record<string, string | undefined> = {
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nCopy .env.example to .env and fill in the values.`,
    );
  }
}

function getRequired(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  firebase: {
    apiKey: getRequired('EXPO_PUBLIC_FIREBASE_API_KEY', process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
    authDomain: getRequired('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: getRequired('EXPO_PUBLIC_FIREBASE_PROJECT_ID', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: getRequired('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: getRequired(
      'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    ),
    appId: getRequired('EXPO_PUBLIC_FIREBASE_APP_ID', process.env.EXPO_PUBLIC_FIREBASE_APP_ID),
    webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID || undefined,
  },
  admob: {
    appIdIos: process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS || undefined,
    appIdAndroid: process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID || undefined,
    rewardedId: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID || undefined,
    interstitialId: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID || undefined,
    bannerId: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || undefined,
  },
  revenuecat: {
    apiKeyIos: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS || undefined,
    apiKeyAndroid: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID || undefined,
  },
} as const;
