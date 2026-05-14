import { create } from 'zustand';
import type { UserProfile, SubscriptionTier } from '../types';

interface AuthState {
  user: UserProfile | null;
  subscriptionTier: SubscriptionTier;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  subscriptionTier: 'free',
  isLoading: false,
  setUser: (user) => set({ user }),
  setSubscriptionTier: (tier) => set({ subscriptionTier: tier }),
  setLoading: (isLoading) => set({ isLoading }),
}));
