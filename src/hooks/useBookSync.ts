import { useState, useEffect, useCallback } from 'react';
import type { Book } from '../types';
import { getBooks, refreshBooks, ALL_BOOKS } from '../data/books';

export interface UseBookSyncResult {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook that loads books on mount (YouTube + mock, with 24-hour in-memory cache)
 * and exposes a pull-to-refresh handler.
 *
 * On any error the hook falls back to ALL_BOOKS (mock data) so the UI
 * always has something to display.
 */
export function useBookSync(): UseBookSyncResult {
  const [books, setBooks] = useState<Book[]>(ALL_BOOKS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = forceRefresh ? await refreshBooks() : await getBooks();
      setBooks(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Kitaplar yüklenemedi.';
      setError(message);
      setBooks(ALL_BOOKS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    void load(false);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { books, isLoading, error, refresh };
}
