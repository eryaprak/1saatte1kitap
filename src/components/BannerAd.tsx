import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import { ADMOB_BANNER_IOS, ADMOB_BANNER_ANDROID } from '../constants';

const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.OS === 'ios'
    ? ADMOB_BANNER_IOS
    : ADMOB_BANNER_ANDROID;

interface AppBannerAdProps {
  /** Optionally hide the banner without unmounting (e.g., while loading) */
  visible?: boolean;
}

export default function AppBannerAd({ visible = true }: AppBannerAdProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});
