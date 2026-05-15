import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { loadAndPlay } from '../../services/audio';
import { showInterstitial } from '../../services/ads';
import { formatMinutes } from '../../utils/formatters';
import { useBookSync } from '../../hooks/useBookSync';
import type { Book } from '../../types';
import { useState } from 'react';

const CATEGORIES = ['Tümü', 'Klasik', 'Destan', 'Tiyatro', 'YouTube'];

export default function HomeScreen() {
  const subscriptionTier = useAuthStore((s) => s.subscriptionTier);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { books, isLoading, refresh } = useBookSync();

  const isFree = subscriptionTier === 'free';

  const filteredBooks =
    selectedCategory === 'Tümü'
      ? books
      : books.filter((b) => b.category === selectedCategory);

  async function handleListen(book: Book) {
    if (loadingId) return;

    setLoadingId(book.id);
    try {
      if (isFree) {
        await showInterstitial();
      }
      await loadAndPlay(book);
    } catch (err) {
      Alert.alert('Hata', 'Ses yüklenemedi. Lütfen tekrar deneyin.');
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#2563EB"
          colors={['#2563EB']}
        />
      }
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Kitapları Keşfet</Text>
        <Text style={styles.heroSubtitle}>
          Günde 1 saatini ayır, bir kitabın özünü öğren.
        </Text>
        {isFree && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>Ücretsiz Plan • Reklam ile desteklenir</Text>
          </View>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat)}
            accessibilityRole="button"
            accessibilityLabel={`${cat} kategorisi`}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat && styles.categoryChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Book List */}
      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Kitaplar yükleniyor...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>{filteredBooks.length} Kitap</Text>
          <View style={styles.bookList}>
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isLoading={loadingId === book.id}
                onListen={() => handleListen(book)}
              />
            ))}
          </View>
        </>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

interface BookCardProps {
  book: Book;
  isLoading: boolean;
  onListen: () => void;
}

function BookCard({ book, isLoading, onListen }: BookCardProps) {
  const isYouTube = Boolean(book.youtubeVideoId);

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: book.coverUrl }}
        style={styles.cardCover}
        resizeMode="cover"
      />
      <View style={styles.cardBody}>
        <View style={styles.cardMeta}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{book.category}</Text>
          </View>
          {isYouTube ? (
            <View style={styles.youtubePill}>
              <Text style={styles.youtubePillText}>YouTube</Text>
            </View>
          ) : (
            <View style={styles.audioPill}>
              <Text style={styles.audioPillText}>Sesli Kitap</Text>
            </View>
          )}
          {book.isPremium && (
            <View style={styles.premiumPill}>
              <Text style={styles.premiumPillText}>Premium</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.cardAuthor} numberOfLines={1}>
          {book.author}
        </Text>
        {book.durationMinutes > 0 && (
          <Text style={styles.cardDuration}>{formatMinutes(book.durationMinutes)}</Text>
        )}
        <Text style={styles.cardSummary} numberOfLines={2}>
          {book.summary}
        </Text>
        <TouchableOpacity
          style={[styles.listenBtn, isLoading && styles.listenBtnLoading]}
          onPress={onListen}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel={`${book.title} dinle`}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.listenBtnText}>▶  Dinle</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  hero: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 24,
    gap: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#BFDBFE',
    lineHeight: 24,
  },
  freeBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  freeBadgeText: {
    fontSize: 11,
    color: '#DBEAFE',
    fontWeight: '500',
  },
  categoryRow: {
    paddingHorizontal: 0,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  categoryChipActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: -4,
  },
  bookList: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardCover: {
    width: 100,
    alignSelf: 'stretch',
    backgroundColor: '#E5E7EB',
  },
  cardBody: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  categoryPill: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryPillText: {
    fontSize: 11,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  youtubePill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  youtubePillText: {
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '600',
  },
  audioPill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  audioPillText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
  },
  premiumPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  premiumPillText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
  },
  cardAuthor: {
    fontSize: 13,
    color: '#6B7280',
  },
  cardDuration: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  cardSummary: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginTop: 2,
  },
  listenBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  listenBtnLoading: {
    backgroundColor: '#93C5FD',
  },
  listenBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  bottomSpacing: {
    height: 80,
  },
});
