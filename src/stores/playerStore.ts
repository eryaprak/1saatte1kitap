import { create } from 'zustand';
import type { Book, PlaybackState } from '../types';

interface PlayerStore extends PlaybackState {
  // Actions
  setCurrentBook: (book: Book | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: 1 | 1.5 | 2) => void;
  resetPlayer: () => void;
}

const initialState: PlaybackState = {
  currentBook: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  playbackRate: 1,
};

export const usePlayerStore = create<PlayerStore>((set) => ({
  ...initialState,
  setCurrentBook: (currentBook) => set({ currentBook }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  resetPlayer: () => set(initialState),
}));
