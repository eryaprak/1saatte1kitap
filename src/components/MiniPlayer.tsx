import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlayerStore } from '../stores/playerStore';
import { togglePlayPause } from '../services/audio';
import { formatDuration } from '../utils/formatters';

export default function MiniPlayer() {
  const router = useRouter();
  const currentBook = usePlayerStore((s) => s.currentBook);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);

  if (!currentBook) return null;

  const progress = duration > 0 ? position / duration : 0;

  function handlePlayPause() {
    togglePlayPause();
  }

  function handleOpenPlayer() {
    router.push('/player');
  }

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.95}
      onPress={handleOpenPlayer}
      accessibilityRole="button"
      accessibilityLabel={`${currentBook.title} - tam ekrana geç`}
    >
      {/* Progress bar at the very top */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.row}>
        {/* Cover */}
        <Image
          source={{ uri: currentBook.coverUrl }}
          style={styles.cover}
          resizeMode="cover"
        />

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentBook.title}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            {currentBook.author}
          </Text>
          <Text style={styles.time}>
            {formatDuration(position)} / {formatDuration(duration)}
          </Text>
        </View>

        {/* Play / Pause button */}
        <TouchableOpacity
          style={styles.playBtn}
          onPress={(e) => {
            e.stopPropagation();
            handlePlayPause();
          }}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Duraklat' : 'Oynat'}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: Platform.OS === 'ios' ? 0 : 4,
    borderTopWidth: 1,
    borderTopColor: '#1D4ED8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#3B82F6',
    marginBottom: 8,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#93C5FD',
    borderRadius: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 8,
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#2563EB',
  },
  info: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  author: {
    fontSize: 12,
    color: '#BFDBFE',
  },
  time: {
    fontSize: 11,
    color: '#93C5FD',
    marginTop: 2,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
