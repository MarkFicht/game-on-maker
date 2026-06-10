import { Platform } from 'react-native';
import { env } from '../../config/env';

export const ENTITLEMENT_ID = 'premium';
export const OFFERING_ID = 'default';

export function getRevenueCatApiKey(): string | null {
  if (Platform.OS === 'ios') return env.revenuecat.apiKeyIos ?? null;
  if (Platform.OS === 'android') return env.revenuecat.apiKeyAndroid ?? null;
  return null;
}
