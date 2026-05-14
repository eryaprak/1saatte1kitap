import type { Book } from '../types';
import {
  fetchChannelVideos,
  getBestThumbnailUrl,
  iso8601DurationToMinutes,
} from '../services/youtubeApi';

// ─── Constants ────────────────────────────────────────────────────────────────

const CHANNEL_ID = 'UCsOLEIWRR81IfPuxBE0FTvw'; // @birsaattebirkitap
const MAX_RESULTS = 50;

// ─── Mock Books (fallback / seed data) ───────────────────────────────────────

export const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'İlyada',
    author: 'Homeros',
    coverUrl: 'https://picsum.photos/seed/ilyada/300/400',
    summary:
      'Truva Savaşı\'nın son yılında geçen destan, Akhilleus\'un öfkesi ve savaşın trajedisini anlatır.',
    category: 'Klasik',
    durationMinutes: 58,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-01',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '2',
    title: 'Odysseia',
    author: 'Homeros',
    coverUrl: 'https://picsum.photos/seed/odysseia/300/400',
    summary:
      'Truva Savaşı\'ndan sonra evine dönen Odysseus\'un on yıllık macera dolu yolculuğu.',
    category: 'Klasik',
    durationMinutes: 62,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-02',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: '3',
    title: 'Manas',
    author: 'Kırgız Halk Destanı',
    coverUrl: 'https://picsum.photos/seed/manas/300/400',
    summary:
      'Kırgız milletinin kahramanı Manas\'ın destansı yaşamını ve savaşlarını anlatan epik şiir.',
    category: 'Destan',
    durationMinutes: 55,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-03',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: '4',
    title: 'Oedipus Rex',
    author: 'Sophokles',
    coverUrl: 'https://picsum.photos/seed/oedipus/300/400',
    summary:
      'Kral Oedipus\'un kendi kaderine meydan okumasını ve acı gerçeği keşfedişini anlatan trajedi.',
    category: 'Tiyatro',
    durationMinutes: 48,
    youtubeVideoId: '',
    isPremium: true,
    createdAt: '2024-01-04',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: '5',
    title: 'Medea',
    author: 'Euripides',
    coverUrl: 'https://picsum.photos/seed/medea/300/400',
    summary:
      'Jason tarafından terk edilen büyücü Medea\'nın intikam ve aşkın sınırlarını zorlayan hikayesi.',
    category: 'Tiyatro',
    durationMinutes: 52,
    youtubeVideoId: '',
    isPremium: true,
    createdAt: '2024-01-05',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: '6',
    title: 'Antigone',
    author: 'Sophokles',
    coverUrl: 'https://picsum.photos/seed/antigone/300/400',
    summary:
      'Kardeşini gömmek isteyen Antigone ile devlet yasasını koruyan Kral Kreon arasındaki trajik çatışma.',
    category: 'Tiyatro',
    durationMinutes: 45,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-06',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
  {
    id: '7',
    title: 'Dede Korkut',
    author: 'Oğuz Türkleri',
    coverUrl: 'https://picsum.photos/seed/dedekorkut/300/400',
    summary:
      'Oğuz Türklerinin destansı kahramanlarının hikayelerini ve geleneklerini anlatan efsanevi eser.',
    category: 'Destan',
    durationMinutes: 60,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-07',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  },
  {
    id: '8',
    title: 'Aeneis',
    author: 'Vergilius',
    coverUrl: 'https://picsum.photos/seed/aeneis/300/400',
    summary:
      'Truvalı kahraman Aeneas\'ın Roma\'yı kurmak için çıktığı zorlu yolculuğu anlatan Latin destanı.',
    category: 'Klasik',
    durationMinutes: 65,
    youtubeVideoId: '',
    isPremium: true,
    createdAt: '2024-01-08',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
];

// ─── YouTube → Book Converter ─────────────────────────────────────────────────

/**
 * Converts a YouTube video into a Book object.
 * audioUrl is left as a placeholder — Step 5 will populate it from the backend.
 */
function videoToBook(video: {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: Parameters<typeof getBestThumbnailUrl>[0];
    publishedAt: string;
  };
  contentDetails: { duration: string };
}): Book {
  const summary =
    video.snippet.description.length > 200
      ? video.snippet.description.slice(0, 197) + '...'
      : video.snippet.description || 'YouTube kanalından otomatik eklendi.';

  return {
    id: `yt_${video.id}`,
    title: video.snippet.title,
    author: '@birsaattebirkitap',
    coverUrl: getBestThumbnailUrl(video.snippet.thumbnails),
    summary,
    category: 'YouTube',
    durationMinutes: iso8601DurationToMinutes(video.contentDetails.duration),
    youtubeVideoId: video.id,
    isPremium: false,
    createdAt: video.snippet.publishedAt,
    audioUrl: '', // placeholder — Step 5
  };
}

// ─── In-Memory Cache ──────────────────────────────────────────────────────────

let _cachedBooks: Book[] | null = null;
let _lastFetchedAt: number | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function isCacheValid(): boolean {
  if (_cachedBooks === null || _lastFetchedAt === null) return false;
  return Date.now() - _lastFetchedAt < CACHE_TTL_MS;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetches books from the YouTube channel and converts them to Book objects.
 * Throws on network/API errors so callers can handle fallback.
 */
export async function fetchBooksFromYouTube(): Promise<Book[]> {
  const videos = await fetchChannelVideos(CHANNEL_ID, MAX_RESULTS);
  return videos.map(videoToBook);
}

/**
 * Returns the full book list (mock + YouTube), using cache if valid.
 * On failure, returns mock books as fallback.
 */
export async function getBooks(): Promise<Book[]> {
  if (isCacheValid()) {
    return _cachedBooks!;
  }

  try {
    const ytBooks = await fetchBooksFromYouTube();
    const all = [...MOCK_BOOKS, ...ytBooks];
    _cachedBooks = all;
    _lastFetchedAt = Date.now();
    return all;
  } catch (err) {
    console.warn('[Books] YouTube fetch failed, using mock data:', err);
    _cachedBooks = MOCK_BOOKS;
    _lastFetchedAt = Date.now();
    return MOCK_BOOKS;
  }
}

/**
 * Force-refreshes the book list, bypassing the cache.
 */
export async function refreshBooks(): Promise<Book[]> {
  _cachedBooks = null;
  _lastFetchedAt = null;
  return getBooks();
}

/**
 * The full combined list (mock + YouTube), exposed as a named export
 * for any component that needs a synchronous seed before async data loads.
 */
export const ALL_BOOKS: Book[] = MOCK_BOOKS;
