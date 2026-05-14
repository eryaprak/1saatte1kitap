import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';
import {
  ADMOB_INTERSTITIAL_IOS,
  ADMOB_INTERSTITIAL_ANDROID,
  ADS_PER_BOOK_FREE_TIER,
} from '../constants';

// Use test IDs in development; swap with real IDs via env vars for production
const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === 'ios'
    ? ADMOB_INTERSTITIAL_IOS
    : ADMOB_INTERSTITIAL_ANDROID;

let adInstance: InterstitialAd | null = null;
let isAdLoaded = false;

function createAd(): InterstitialAd {
  const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
    requestNonPersonalizedAdsOnly: false,
  });
  return ad;
}

function loadAd(): Promise<InterstitialAd> {
  return new Promise((resolve, reject) => {
    const ad = createAd();

    const loadedUnsubscribe = ad.addAdEventListener(AdEventType.LOADED, () => {
      isAdLoaded = true;
      loadedUnsubscribe();
      resolve(ad);
    });

    const errorUnsubscribe = ad.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        isAdLoaded = false;
        errorUnsubscribe();
        reject(error);
      }
    );

    ad.load();
  });
}

function showAd(ad: InterstitialAd): Promise<void> {
  return new Promise((resolve, reject) => {
    const closedUnsubscribe = ad.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        closedUnsubscribe();
        resolve();
      }
    );

    const errorUnsubscribe = ad.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        errorUnsubscribe();
        reject(error);
      }
    );

    try {
      ad.show();
    } catch (err) {
      errorUnsubscribe();
      closedUnsubscribe();
      reject(err);
    }
  });
}

/**
 * Shows `count` interstitial ads sequentially.
 * If any ad fails to load or show, the sequence stops gracefully
 * and the caller proceeds (never blocks the user).
 */
export async function showInterstitialSequence(
  count: number = ADS_PER_BOOK_FREE_TIER
): Promise<void> {
  for (let i = 0; i < count; i++) {
    try {
      const ad = await loadAd();
      await showAd(ad);
    } catch {
      // Ad failed – skip remaining ads and let the book play
      return;
    }
  }
}

/**
 * Preloads a single interstitial so the first show is instant.
 * Call this from the root layout after AdMob is initialised.
 */
export function preloadInterstitial(): void {
  loadAd()
    .then((ad) => {
      adInstance = ad;
      isAdLoaded = true;
    })
    .catch(() => {
      adInstance = null;
      isAdLoaded = false;
    });
}

export { isAdLoaded };
