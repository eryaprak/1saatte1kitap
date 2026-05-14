import { supabase } from './supabase';
import type { Book } from '../types';
import { getBooks as getLocalBooks } from '../data/books';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupabaseBook {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  summary: string;
  category: string;
  duration_minutes: number;
  youtube_video_id: string;
  audio_url: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

interface SupabaseProgress {
  id: string;
  user_id: string;
  book_id: string;
  position_seconds: number;
  completed: boolean;
  last_played_at: string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapBook(row: SupabaseBook): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    coverUrl: row.cover_url,
    summary: row.summary,
    category: row.category,
    durationMinutes: row.duration_minutes,
    youtubeVideoId: row.youtube_video_id,
    audioUrl: row.audio_url,
    isPremium: row.is_premium,
    createdAt: row.created_at,
  };
}

// ─── Books ────────────────────────────────────────────────────────────────────

/**
 * Fetches books from Supabase.
 * Falls back to local data (YouTube + mock) if the table is empty or unreachable.
 */
export async function fetchBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    console.warn('[BooksApi] Supabase fetch failed or empty, using local data:', error?.message);
    return getLocalBooks();
  }

  return (data as SupabaseBook[]).map(mapBook);
}

/**
 * Fetches a single book by ID from Supabase.
 * Returns null if not found.
 */
export async function fetchBookById(id: string): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapBook(data as SupabaseBook);
}

/**
 * Inserts or updates books from YouTube into the Supabase books table.
 * Requires service_role key — intended for server-side / admin use.
 * In the mobile app this is a no-op when anon key is used (RLS will block).
 */
export async function syncYouTubeBooks(books: Book[]): Promise<void> {
  const rows = books.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    cover_url: b.coverUrl,
    summary: b.summary,
    category: b.category,
    duration_minutes: b.durationMinutes,
    youtube_video_id: b.youtubeVideoId,
    audio_url: b.audioUrl,
    is_premium: b.isPremium,
  }));

  const { error } = await supabase
    .from('books')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.warn('[BooksApi] syncYouTubeBooks failed:', error.message);
  }
}

// ─── Progress ─────────────────────────────────────────────────────────────────

/**
 * Saves (upserts) playback progress for the authenticated user.
 */
export async function updateProgress(
  bookId: string,
  positionSeconds: number,
  completed = false,
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return;

  const { error } = await supabase.from('user_progress').upsert(
    {
      user_id: session.user.id,
      book_id: bookId,
      position_seconds: positionSeconds,
      completed,
      last_played_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,book_id' },
  );

  if (error) {
    console.warn('[BooksApi] updateProgress failed:', error.message);
  }
}

/**
 * Returns the saved playback position (in seconds) for a book, or 0 if none.
 */
export async function getProgress(bookId: string): Promise<number> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return 0;

  const { data, error } = await supabase
    .from('user_progress')
    .select('position_seconds')
    .eq('user_id', session.user.id)
    .eq('book_id', bookId)
    .single();

  if (error || !data) return 0;
  return (data as Pick<SupabaseProgress, 'position_seconds'>).position_seconds;
}

/**
 * Returns all progress rows for the authenticated user.
 */
export async function getAllProgress(): Promise<SupabaseProgress[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return [];

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', session.user.id);

  if (error || !data) return [];
  return data as SupabaseProgress[];
}
