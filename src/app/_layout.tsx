import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import MobileAds from 'react-native-google-mobile-ads';
import AppBannerAd from '../components/BannerAd';
import {
  configurePurchases,
  fetchCustomerInfo,
  addCustomerInfoUpdateListener,
} from '../services/purchases';
import { useAuthStore } from '../stores/authStore';
import { getSubscriptionTier } from '../services/purchases';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const setSubscriptionTier = useAuthStore((s) => s.setSubscriptionTier);
  const initAnonymousSession = useAuthStore((s) => s.initAnonymousSession);
  const startAuthListener = useAuthStore((s) => s.startAuthListener);
  const [adsReady, setAdsReady] = useState(false);

  // Initialise AdMob once on mount
  useEffect(() => {
    MobileAds()
      .initialize()
      .then(() => setAdsReady(true))
      .catch(() => setAdsReady(true)); // still show banner slot on error
  }, []);

  // Initialise Supabase auth (anonymous sign-in + session listener)
  useEffect(() => {
    void initAnonymousSession();
    const unsubscribeAuth = startAuthListener();
    return unsubscribeAuth;
  }, [initAnonymousSession, startAuthListener]);

  // Initialise RevenueCat and sync subscription tier
  useEffect(() => {
    async function initPurchases() {
      await configurePurchases();

      const info = await fetchCustomerInfo();
      if (info) {
        setSubscriptionTier(getSubscriptionTier(info));
      }
    }

    initPurchases();

    // Keep subscription tier in sync while app is running
    const unsubscribe = addCustomerInfoUpdateListener((info) => {
      setSubscriptionTier(getSubscriptionTier(info));
    });

    return unsubscribe;
  }, [setSubscriptionTier]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <View style={styles.root}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="player"
            options={{
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="admin"
            options={{
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
        {/* One banner shown for everyone on app open – stays mounted */}
        {adsReady && <AppBannerAd />}
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
