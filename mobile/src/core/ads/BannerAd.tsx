import React from 'react';
import { Platform, View } from 'react-native';
import { useAdsContext } from './AdsProvider';
import { env } from '../../config/env';

interface BannerAdProps {
  testID?: string;
}

export function BannerAd({ testID }: BannerAdProps) {
  const { canShowAds } = useAdsContext();

  if (!canShowAds || Platform.OS === 'web') return null;

  return <BannerAdNative testID={testID} />;
}

// Loaded lazily so web bundler never tries to resolve native module
function BannerAdNative({ testID }: BannerAdProps) {
  const {
    BannerAd: RNBannerAd,
    BannerAdSize,
    TestIds,
  } = require('react-native-google-mobile-ads');

  const adUnitId = __DEV__
    ? TestIds.ADAPTIVE_BANNER
    : (env.admob.bannerId ?? TestIds.ADAPTIVE_BANNER);

  return (
    <View testID={testID}>
      <RNBannerAd unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}
