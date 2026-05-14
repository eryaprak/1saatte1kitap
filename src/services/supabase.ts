import { createClient } from '@supabase/supabase-js';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

// ─── Client ───────────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type { Session, User };

// ─── Anonymous Auth ───────────────────────────────────────────────────────────

/**
 * Signs in anonymously if no session exists.
 * Returns the session (existing or newly created).
 */
export async function signInAnonymously(): Promise<Session | null> {
  const {
    data: { session: existing },
  } = await supabase.auth.getSession();

  if (existing) return existing;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.warn('[Auth] Anonymous sign-in failed:', error.message);
    return null;
  }
  return data.session;
}

// ─── Email Auth ───────────────────────────────────────────────────────────────

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<Session | null> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return data.session;
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<Session | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data.session;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// ─── Session Listener ─────────────────────────────────────────────────────────

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}

// ─── Realtime — books table ───────────────────────────────────────────────────

type RealtimeCallback = () => void;

/**
 * Subscribe to INSERT/UPDATE/DELETE events on the books table.
 * Returns a cleanup function.
 */
export function subscribeToBooksChanges(onChanged: RealtimeCallback): () => void {
  const channel = supabase
    .channel('books-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'books' },
      () => onChanged(),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
