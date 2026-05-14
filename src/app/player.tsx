import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import { useRef } from 'react';
import { useRouter } from 'expo-router';
import { usePlayerStore } from '../stores/playerStore';
import {
  togglePlayPause,
  seekTo,
  seekForward,
  seekBackward,
  setRate,
} from '../services/audio';
import { formatDuration } from '../utils/formatters';

const RATE_OPTIONS: Array<1 | 1.5 | 2> = [1, 1.5, 2];

export default function PlayerScreen() {
  const router = useRouter();
  const currentBook = usePlayerStore((s) => s.currentBook);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const playbackRate = usePlayerStore((s) => s.playbackRate);

  const sliderWidthRef = useRef<number>(0);

  if (!currentBook) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Hiç kitap seçilmedi.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = duration > 0 ? position / duration : 0;

  function seekFromTouchX(x: number) {
    if (sliderWidthRef.current <= 0 || duration <= 0) return;
    const ratio = Math.min(1, Math.max(0, x / sliderWidthRef.current));
    seekTo(ratio * duration);
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt: GestureResponderEvent) => {
      seekFromTouchX(evt.nativeEvent.locationX);
    },
    onPanResponderMove: (evt: GestureResponderEvent) => {
      seekFromTouchX(evt.nativeEvent.locationX);
    },
  });

  async function handleRateChange(rate: 1 | 1.5 | 2) {
    await setRate(rate);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      bounces={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Kapat"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Şu An Dinleniyor</Text>
        <View style={styles.closeBtnPlaceholder} />
      </View>

      {/* Cover */}
      <Image
        source={{ uri: currentBook.coverUrl }}
        style={styles.cover}
        resizeMode="cover"
      />

      {/* Book info */}
      <View style={styles.bookInfo}>
        <Text style={styles.title}>{currentBook.title}</Text>
        <Text style={styles.author}>{currentBook.author}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{currentBook.category}</Text>
        </View>
      </View>

      {/* Progress slider */}
      <View style={styles.sliderContainer}>
        <View
          style={styles.sliderTrack}
          onLayout={(e) => {
            sliderWidthRef.current = e.nativeEvent.layout.width;
          }}
          {...panResponder.panHandlers}
        >
          <View style={[styles.sliderFill, { width: `${progress * 100}%` as `${number}%` }]} />
          <View
            style={[
              styles.sliderThumb,
              { left: sliderWidthRef.current * progress - 8 },
            ]}
          />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatDuration(position)}</Text>
          <Text style={styles.timeText}>{formatDuration(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Backward 15s */}
        <TouchableOpacity
          style={styles.ctrlBtn}
          onPress={() => seekBackward(15)}
          accessibilityRole="button"
          accessibilityLabel="15 saniye geri"
        >
          <Text style={styles.ctrlIcon}>⏪</Text>
          <Text style={styles.ctrlLabel}>15s</Text>
        </TouchableOpacity>

        {/* Play / Pause */}
        <TouchableOpacity
          style={styles.playBtn}
          onPress={() => togglePlayPause()}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Duraklat' : 'Oynat'}
        >
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        {/* Forward 30s */}
        <TouchableOpacity
          style={styles.ctrlBtn}
          onPress={() => seekForward(30)}
          accessibilityRole="button"
          accessibilityLabel="30 saniye ileri"
        >
          <Text style={styles.ctrlIcon}>⏩</Text>
          <Text style={styles.ctrlLabel}>30s</Text>
        </TouchableOpacity>
      </View>

      {/* Playback rate */}
      <View style={styles.rateContainer}>
        <Text style={styles.rateLabel}>Hız:</Text>
        {RATE_OPTIONS.map((rate) => (
          <TouchableOpacity
            key={rate}
            style={[styles.rateBtn, playbackRate === rate && styles.rateBtnActive]}
            onPress={() => handleRateChange(rate)}
            accessibilityRole="button"
            accessibilityLabel={`${rate}x hız`}
          >
            <Text
              style={[
                styles.rateBtnText,
                playbackRate === rate && styles.rateBtnTextActive,
              ]}
            >
              {rate}x
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Kitap Özeti</Text>
        <Text style={styles.summaryText}>{currentBook.summary}</Text>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  backBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  closeBtnPlaceholder: {
    width: 32,
  },
  cover: {
    width: 240,
    height: 320,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  bookInfo: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  author: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  categoryBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  sliderContainer: {
    width: '100%',
    marginBottom: 24,
  },
  sliderTrack: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 8,
  },
  sliderFill: {
    height: 4,
    backgroundColor: '#2563EB',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 8,
  },
  sliderThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    position: 'absolute',
    top: 2,
    marginLeft: -8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    marginBottom: 24,
  },
  ctrlBtn: {
    alignItems: 'center',
    gap: 2,
  },
  ctrlIcon: {
    fontSize: 28,
  },
  ctrlLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  playIcon: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  rateLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  rateBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  rateBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  rateBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  rateBtnTextActive: {
    color: '#2563EB',
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 40,
  },
});
