export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  summary: string;
  category: string;
  durationMinutes: number;
  youtubeVideoId: string;
  isPremium: boolean;
  createdAt: string;
  audioUrl: string;
}

export interface UserProfile {
  id: string;
  email: string;
  isPremium: boolean;
  purchaseExpiry?: string;
}

export type SubscriptionTier = 'free' | 'monthly' | 'yearly';

export interface PlaybackState {
  currentBook: Book | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  playbackRate: 1 | 1.5 | 2;
}
