// App constants
export const APP_NAME = '1 Saatte 1 Kitap';
export const APP_VERSION = '1.0.0';

// Subscription pricing
export const PRICE_MONTHLY = 49.90;
export const PRICE_YEARLY = 499.90;

// RevenueCat
export const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
export const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

// RevenueCat product identifiers
export const PRODUCT_MONTHLY = 'com.eryaprak.1saatte1kitap.monthly';
export const PRODUCT_YEARLY = 'com.eryaprak.1saatte1kitap.yearly';

// Ads - Google test IDs (replace with real IDs for production)
export const ADMOB_IOS_APP_ID = 'ca-app-pub-3940256099942544~1458002511';
export const ADMOB_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
export const ADMOB_INTERSTITIAL_IOS = 'ca-app-pub-3940256099942544/4411468910';
export const ADMOB_INTERSTITIAL_ANDROID = 'ca-app-pub-3940256099942544/1033173712';
export const ADMOB_BANNER_IOS = 'ca-app-pub-3940256099942544/2934735716';
export const ADMOB_BANNER_ANDROID = 'ca-app-pub-3940256099942544/6300978111';

// Free tier: number of ads shown before a book starts
export const ADS_PER_BOOK_FREE_TIER = 2;

// Supabase
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// YouTube
export const YOUTUBE_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY ?? '';
