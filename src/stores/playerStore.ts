import { create } from 'zustand';
import type { Book, PlaybackState } from '../types';
import { updateProgress, getProgress } from '../services/booksApi';

// ─── Constants ────────────────────────────────────────────────────────────────

const PROGRESS_SAVE_INTERVAL_MS = 10_000; // save every 10 seconds

// ─── Store Interface ──────────────────────────────────────────────────────────

interface PlayerStore extends PlaybackState {
  // Actions
  setCurrentBook: (book: Book | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: 1 | 1.5 | 2) => void;
  resetPlayer: () => void;
  // Progress persistence
  loadProgress: (bookId: string) => Promise<number>;
  saveProgress: () => Promise<void>;
  startProgressTimer: () => void;
  stopProgressTimer: () => void;
}

// ─── Internal timer ref ───────────────────────────────────────────────────────

let _progressTimer: ReturnType<typeof setInterval> | null = null;

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: PlaybackState = {
  currentBook: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  playbackRate: 1,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  ...initialState,

  setCurrentBook: (currentBook) => set({ currentBook }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),

  resetPlayer: () => {
    get().stopProgressTimer();
    set(initialState);
  },

  /**
   * Fetches the saved progress position for a book from Supabase.
   * Returns the saved position in seconds (0 if none).
   */
  loadProgress: async (bookId: string): Promise<number> => {
    const saved = await getProgress(bookId);
    return saved;
  },

  /**
   * Saves the current playback position to Supabase.
   * No-op if no book is loaded.
   */
  saveProgress: async (): Promise<void> => {
    const { currentBook, position, duration } = get();
    if (!currentBook) return;

    const completed = duration > 0 && position >= duration - 5;
    await updateProgress(currentBook.id, position, completed);
  },

  /**
   * Starts a repeating timer that saves progress every 10 seconds.
   * Clears any existing timer first to prevent duplicates.
   */
  startProgressTimer: () => {
    if (_progressTimer !== null) {
      clearInterval(_progressTimer);
    }
    _progressTimer = setInterval(() => {
      void get().saveProgress();
    }, PROGRESS_SAVE_INTERVAL_MS);
  },

  /**
   * Stops the repeating progress timer.
   */
  stopProgressTimer: () => {
    if (_progressTimer !== null) {
      clearInterval(_progressTimer);
      _progressTimer = null;
    }
  },
}));
