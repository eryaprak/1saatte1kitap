import React from 'react';
import { View } from 'react-native';

// Stub: google-mobile-ads kaldırıldı, premium app — reklam yok
export default function AppBannerAd({ visible = true }: { visible?: boolean }) {
  return visible ? <View style={{ height: 0 }} /> : null;
}
