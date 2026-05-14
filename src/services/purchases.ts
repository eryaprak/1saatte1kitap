import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import {
  REVENUECAT_IOS_KEY,
  REVENUECAT_ANDROID_KEY,
  PRODUCT_MONTHLY,
  PRODUCT_YEARLY,
} from '../constants';
import type { SubscriptionTier } from '../types';

// ─── Init ───────────────────────────────────────────────────────────────────

let isConfigured = false;

export async function configurePurchases(): Promise<void> {
  if (isConfigured) return;

  const apiKey =
    Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;

  if (!apiKey) {
    if (__DEV__) {
      console.warn('[Purchases] RevenueCat API key is not set. Skipping init.');
    }
    return;
  }

  if (__DEV__) {
    await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  Purchases.configure({ apiKey });
  isConfigured = true;
}

// ─── Subscription tier helper ────────────────────────────────────────────────

export function getSubscriptionTier(
  customerInfo: CustomerInfo
): SubscriptionTier {
  const activeEntitlements = customerInfo.entitlements.active;

  if (activeEntitlements['yearly'] || activeEntitlements[PRODUCT_YEARLY]) {
    return 'yearly';
  }
  if (activeEntitlements['monthly'] || activeEntitlements[PRODUCT_MONTHLY]) {
    return 'monthly';
  }
  return 'free';
}

// ─── Fetch current customer info ────────────────────────────────────────────

export async function fetchCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isConfigured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

// ─── Offerings ──────────────────────────────────────────────────────────────

export async function fetchOfferings(): Promise<PurchasesOffering | null> {
  if (!isConfigured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

// ─── Purchase ───────────────────────────────────────────────────────────────

export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<{ customerInfo: CustomerInfo; tier: SubscriptionTier } | null> {
  if (!isConfigured) return null;
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { customerInfo, tier: getSubscriptionTier(customerInfo) };
  } catch (error: unknown) {
    // User cancelled – not an actual error
    const err = error as { userCancelled?: boolean };
    if (err?.userCancelled) return null;
    throw error;
  }
}

// ─── Restore ────────────────────────────────────────────────────────────────

export async function restorePurchases(): Promise<{
  customerInfo: CustomerInfo;
  tier: SubscriptionTier;
} | null> {
  if (!isConfigured) return null;
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { customerInfo, tier: getSubscriptionTier(customerInfo) };
  } catch {
    return null;
  }
}

// ─── Listener ───────────────────────────────────────────────────────────────

/**
 * Subscribe to customer info updates.
 * Returns an unsubscribe function to be called on cleanup.
 */
export function addCustomerInfoUpdateListener(
  callback: (info: CustomerInfo) => void
): () => void {
  Purchases.addCustomerInfoUpdateListener(callback);
  return () => Purchases.removeCustomerInfoUpdateListener(callback);
}
