import { create } from 'zustand';
import type { UserProfile, SubscriptionTier } from '../types';
import type { Session } from '../services/supabase';
import {
  signInAnonymously,
  signInWithEmail,
  signUpWithEmail,
  signOut as supabaseSignOut,
  onAuthStateChange,
} from '../services/supabase';

interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  subscriptionTier: SubscriptionTier;
  isLoading: boolean;
  // Setters (used internally + by purchases service)
  setUser: (user: UserProfile | null) => void;
  setSession: (session: Session | null) => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  setLoading: (loading: boolean) => void;
  // Auth actions
  initAnonymousSession: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // Subscribe to Supabase auth state changes (call once on app mount)
  startAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  subscriptionTier: 'free',
  isLoading: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setSubscriptionTier: (tier) => set({ subscriptionTier: tier }),
  setLoading: (isLoading) => set({ isLoading }),

  initAnonymousSession: async () => {
    // Skip if a session already exists
    if (get().session) return;
    set({ isLoading: true });
    try {
      const session = await signInAnonymously();
      if (session) {
        const u = session.user;
        set({
          session,
          user: {
            id: u.id,
            email: u.email ?? '',
            isPremium: false,
          },
        });
      }
    } catch (err) {
      console.warn('[AuthStore] Anonymous init failed:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithEmail: async (email, password) => {
    set({ isLoading: true });
    try {
      const session = await signInWithEmail(email, password);
      if (session) {
        const u = session.user;
        set({
          session,
          user: {
            id: u.id,
            email: u.email ?? email,
            isPremium: false,
          },
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  registerWithEmail: async (email, password) => {
    set({ isLoading: true });
    try {
      const session = await signUpWithEmail(email, password);
      if (session) {
        const u = session.user;
        set({
          session,
          user: {
            id: u.id,
            email: u.email ?? email,
            isPremium: false,
          },
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await supabaseSignOut();
    set({ user: null, session: null, subscriptionTier: 'free' });
  },

  startAuthListener: () =>
    onAuthStateChange((event, session) => {
      if (session) {
        const u = session.user;
        set({
          session,
          user: {
            id: u.id,
            email: u.email ?? '',
            isPremium: get().subscriptionTier !== 'free',
          },
        });
      } else {
        set({ session: null, user: null });
      }
    }),
}));
