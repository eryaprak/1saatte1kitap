import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { PurchasesPackage, PurchasesOffering } from 'react-native-purchases';
import { useAuthStore } from '../../stores/authStore';
import {
  fetchOfferings,
  purchasePackage,
  restorePurchases,
} from '../../services/purchases';
import { PRICE_MONTHLY, PRICE_YEARLY } from '../../constants';

interface SettingsRowProps {
  label: string;
  value?: string;
}

function SettingsRow({ label, value }: SettingsRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
    </View>
  );
}

const TIER_LABELS: Record<string, string> = {
  free: 'Ücretsiz',
  monthly: 'Premium (Aylık)',
  yearly: 'Premium (Yıllık)',
};

export default function SettingsScreen() {
  const subscriptionTier = useAuthStore((s) => s.subscriptionTier);
  const setSubscriptionTier = useAuthStore((s) => s.setSubscriptionTier);

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loadingOffering, setLoadingOffering] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const isPremium = subscriptionTier !== 'free';

  const loadOffering = useCallback(async () => {
    setLoadingOffering(true);
    const result = await fetchOfferings();
    setOffering(result);
    setLoadingOffering(false);
  }, []);

  useEffect(() => {
    if (!isPremium) {
      loadOffering();
    }
  }, [isPremium, loadOffering]);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setPurchasing(pkg.identifier);
    try {
      const result = await purchasePackage(pkg);
      if (result) {
        setSubscriptionTier(result.tier);
        Alert.alert('Başarılı', 'Premium aboneliğiniz aktif edildi.');
      }
    } catch {
      Alert.alert('Hata', 'Satın alma işlemi tamamlanamadı. Lütfen tekrar deneyin.');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const result = await restorePurchases();
      if (result && result.tier !== 'free') {
        setSubscriptionTier(result.tier);
        Alert.alert('Başarılı', 'Aboneliğiniz geri yüklendi.');
      } else {
        Alert.alert('Bilgi', 'Aktif bir abonelik bulunamadı.');
      }
    } catch {
      Alert.alert('Hata', 'Geri yükleme işlemi başarısız oldu.');
    } finally {
      setRestoring(false);
    }
  };

  // Find monthly and yearly packages from the current offering
  const monthlyPkg = offering?.availablePackages.find(
    (p) =>
      p.packageType === 'MONTHLY' ||
      p.product.identifier.includes('monthly')
  ) ?? null;

  const yearlyPkg = offering?.availablePackages.find(
    (p) =>
      p.packageType === 'ANNUAL' ||
      p.product.identifier.includes('yearly')
  ) ?? null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ─── Subscription section ──────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Abonelik</Text>

        {isPremium ? (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeIcon}>✓</Text>
            <View>
              <Text style={styles.activeBadgeTitle}>
                {TIER_LABELS[subscriptionTier]}
              </Text>
              <Text style={styles.activeBadgeSubtitle}>
                Reklamlardan kurtuldunuz, keyfini çıkarın!
              </Text>
            </View>
          </View>
        ) : (
          <>
            {/* ── Pricing cards ── */}
            <View style={styles.pricingRow}>
              {/* Monthly card */}
              <View style={[styles.pricingCard, styles.pricingCardShadow]}>
                <Text style={styles.pricingPeriod}>Aylık</Text>
                <Text style={styles.pricingPrice}>
                  {PRICE_MONTHLY.toFixed(2).replace('.', ',')} ₺
                </Text>
                <Text style={styles.pricingPerUnit}>/ ay</Text>
                <TouchableOpacity
                  style={[
                    styles.purchaseButton,
                    purchasing === monthlyPkg?.identifier && styles.purchaseButtonDisabled,
                  ]}
                  onPress={() => monthlyPkg && handlePurchase(monthlyPkg)}
                  disabled={
                    !monthlyPkg ||
                    purchasing !== null ||
                    loadingOffering
                  }
                >
                  {purchasing === monthlyPkg?.identifier ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.purchaseButtonText}>Satın Al</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Yearly card */}
              <View style={[styles.pricingCard, styles.pricingCardHighlight, styles.pricingCardShadow]}>
                <View style={styles.bestValueTag}>
                  <Text style={styles.bestValueText}>En İyi Değer</Text>
                </View>
                <Text style={[styles.pricingPeriod, styles.pricingPeriodLight]}>Yıllık</Text>
                <Text style={[styles.pricingPrice, styles.pricingPriceLight]}>
                  {PRICE_YEARLY.toFixed(2).replace('.', ',')} ₺
                </Text>
                <Text style={[styles.pricingPerUnit, styles.pricingPerUnitLight]}>/ yıl</Text>
                <TouchableOpacity
                  style={[
                    styles.purchaseButton,
                    styles.purchaseButtonLight,
                    purchasing === yearlyPkg?.identifier && styles.purchaseButtonDisabled,
                  ]}
                  onPress={() => yearlyPkg && handlePurchase(yearlyPkg)}
                  disabled={
                    !yearlyPkg ||
                    purchasing !== null ||
                    loadingOffering
                  }
                >
                  {purchasing === yearlyPkg?.identifier ? (
                    <ActivityIndicator color="#2563EB" size="small" />
                  ) : (
                    <Text style={[styles.purchaseButtonText, styles.purchaseButtonTextDark]}>
                      Satın Al
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {loadingOffering && (
              <ActivityIndicator style={styles.loadingSpinner} color="#2563EB" />
            )}

            {/* Restore purchases */}
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={restoring}
            >
              {restoring ? (
                <ActivityIndicator color="#6B7280" size="small" />
              ) : (
                <Text style={styles.restoreText}>Satın Alımları Geri Yükle</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* ─── App info ─────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uygulama</Text>
        <SettingsRow label="Versiyon" value="1.0.0" />
        <SettingsRow label="Telif Hakkı" value="© 2024 Eryaprak" />
        <SettingsRow label="Abonelik Durumu" value={TIER_LABELS[subscriptionTier]} />
      </View>

      {/* ─── Legal ────────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yasal</Text>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowLabel}>Gizlilik Politikası</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowLabel}>Kullanım Koşulları</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    gap: 24,
    paddingBottom: 40,
  },
  section: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  row: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 2,
  },
  rowLabel: {
    fontSize: 15,
    color: '#111827',
  },
  rowValue: {
    fontSize: 15,
    color: '#6B7280',
  },
  activeBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  activeBadgeIcon: {
    fontSize: 28,
    color: '#059669',
  },
  activeBadgeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#065F46',
  },
  activeBadgeSubtitle: {
    fontSize: 13,
    color: '#047857',
    marginTop: 2,
  },
  pricingRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pricingCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  pricingCardHighlight: {
    backgroundColor: '#2563EB',
  },
  pricingCardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  bestValueTag: {
    backgroundColor: '#FCD34D',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 4,
  },
  bestValueText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  pricingPeriod: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  pricingPeriodLight: {
    color: '#BFDBFE',
  },
  pricingPrice: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  pricingPriceLight: {
    color: '#FFFFFF',
  },
  pricingPerUnit: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  pricingPerUnitLight: {
    color: '#93C5FD',
  },
  purchaseButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  purchaseButtonLight: {
    backgroundColor: '#FFFFFF',
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  purchaseButtonTextDark: {
    color: '#2563EB',
  },
  loadingSpinner: {
    marginTop: 8,
  },
  restoreButton: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 12,
  },
  restoreText: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
});
