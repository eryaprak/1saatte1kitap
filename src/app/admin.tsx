import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import { fetchBooksFromYouTube } from '../data/books';
import { syncYouTubeBooks } from '../services/booksApi';
import type { Book } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  email: string | null;
  is_premium: boolean;
  subscription_tier: string;
  created_at: string;
}

interface AdminBook {
  id: string;
  title: string;
  author: string;
  category: string;
  duration_minutes: number;
  is_premium: boolean;
  youtube_video_id: string;
}

// ─── Check whether the current user is an admin ───────────────────────────────

async function isAdminUser(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return false;

  // Admin check: look for `is_admin` claim in JWT app_metadata
  const meta = (session.user.app_metadata ?? {}) as Record<string, unknown>;
  return meta['is_admin'] === true;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminScreen() {
  const user = useAuthStore((s) => s.user);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'books' | 'users'>('books');
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Add/edit modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<AdminBook | null>(null);
  const [form, setForm] = useState<Partial<Book>>({});

  // ── Admin gate ──────────────────────────────────────────────────────────────

  useEffect(() => {
    isAdminUser()
      .then(setIsAdmin)
      .catch(() => setIsAdmin(false));
  }, [user]);

  // ── Data loaders ────────────────────────────────────────────────────────────

  const loadBooks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('books')
      .select('id,title,author,category,duration_minutes,is_premium,youtube_video_id')
      .order('created_at', { ascending: false });

    if (!error && data) setBooks(data as AdminBook[]);
    setLoading(false);
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('id,email,is_premium,subscription_tier,created_at')
      .order('created_at', { ascending: false });

    if (!error && data) setUsers(data as AdminUser[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin !== true) return;
    if (activeTab === 'books') void loadBooks();
    else void loadUsers();
  }, [isAdmin, activeTab, loadBooks, loadUsers]);

  // ── YouTube Sync ─────────────────────────────────────────────────────────────

  const handleYouTubeSync = async () => {
    setSyncing(true);
    try {
      const ytBooks = await fetchBooksFromYouTube();
      await syncYouTubeBooks(ytBooks);
      Alert.alert('Başarılı', `${ytBooks.length} kitap senkronize edildi.`);
      await loadBooks();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      Alert.alert('Hata', msg);
    } finally {
      setSyncing(false);
    }
  };

  // ── Book CRUD ────────────────────────────────────────────────────────────────

  const openAddModal = () => {
    setEditingBook(null);
    setForm({});
    setModalVisible(true);
  };

  const openEditModal = (book: AdminBook) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      durationMinutes: book.duration_minutes,
      isPremium: book.is_premium,
      youtubeVideoId: book.youtube_video_id,
    });
    setModalVisible(true);
  };

  const handleSaveBook = async () => {
    if (!form.title || !form.author) {
      Alert.alert('Hata', 'Başlık ve yazar zorunlu.');
      return;
    }

    const row = {
      title: form.title ?? '',
      author: form.author ?? '',
      category: form.category ?? 'Genel',
      duration_minutes: form.durationMinutes ?? 0,
      is_premium: form.isPremium ?? false,
      youtube_video_id: form.youtubeVideoId ?? '',
      cover_url: form.coverUrl ?? '',
      summary: form.summary ?? '',
      audio_url: form.audioUrl ?? '',
    };

    const { error } = editingBook
      ? await supabase.from('books').update(row).eq('id', editingBook.id)
      : await supabase.from('books').insert(row);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    setModalVisible(false);
    await loadBooks();
  };

  const handleDeleteBook = (id: string) => {
    Alert.alert('Sil', 'Bu kitabı silmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('books').delete().eq('id', id);
          await loadBooks();
        },
      },
    ]);
  };

  // ── Render gates ─────────────────────────────────────────────────────────────

  if (isAdmin === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#2563EB" />
      </View>
    );
  }

  if (isAdmin === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.deniedTitle}>Erişim Reddedildi</Text>
        <Text style={styles.deniedSub}>Bu sayfa yalnızca admin kullanıcılara açıktır.</Text>
      </View>
    );
  }

  // ── Full admin UI ─────────────────────────────────────────────────────────────

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Admin Paneli</Text>

      {/* ── Tab bar ── */}
      <View style={styles.tabBar}>
        {(['books', 'users'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'books' ? 'Kitaplar' : 'Kullanıcılar'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Books tab ── */}
      {activeTab === 'books' && (
        <>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.btnPrimary} onPress={openAddModal}>
              <Text style={styles.btnPrimaryText}>+ Kitap Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnSecondary, syncing && styles.btnDisabled]}
              onPress={handleYouTubeSync}
              disabled={syncing}
            >
              {syncing ? (
                <ActivityIndicator color="#2563EB" size="small" />
              ) : (
                <Text style={styles.btnSecondaryText}>YouTube Sync</Text>
              )}
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator style={styles.spinner} color="#2563EB" />
          ) : (
            books.map((book) => (
              <View key={book.id} style={styles.card}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{book.title}</Text>
                  <Text style={styles.cardSub}>{book.author} · {book.category}</Text>
                  {book.is_premium && (
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumBadgeText}>Premium</Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => openEditModal(book)}>
                    <Text style={styles.editBtn}>Düzenle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteBook(book.id)}>
                    <Text style={styles.deleteBtn}>Sil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </>
      )}

      {/* ── Users tab ── */}
      {activeTab === 'users' && (
        <>
          {loading ? (
            <ActivityIndicator style={styles.spinner} color="#2563EB" />
          ) : (
            users.map((u) => (
              <View key={u.id} style={styles.card}>
                <Text style={styles.cardTitle}>{u.email ?? '(anonim)'}</Text>
                <Text style={styles.cardSub}>
                  {u.subscription_tier} · {u.is_premium ? 'Premium' : 'Ücretsiz'}
                </Text>
                <Text style={styles.cardSub}>
                  Kayıt: {new Date(u.created_at).toLocaleDateString('tr-TR')}
                </Text>
              </View>
            ))
          )}
        </>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingBook ? 'Kitabı Düzenle' : 'Yeni Kitap'}
          </Text>

          {([
            { key: 'title', label: 'Başlık', placeholder: 'Kitap başlığı' },
            { key: 'author', label: 'Yazar', placeholder: 'Yazar adı' },
            { key: 'category', label: 'Kategori', placeholder: 'Genel' },
            { key: 'summary', label: 'Özet', placeholder: 'Kitap özeti', multiline: true },
            { key: 'coverUrl', label: 'Kapak URL', placeholder: 'https://...' },
            { key: 'audioUrl', label: 'Ses URL', placeholder: 'https://...' },
            { key: 'youtubeVideoId', label: 'YouTube Video ID', placeholder: 'dQw4w9WgXcQ' },
          ] as Array<{ key: keyof Book; label: string; placeholder: string; multiline?: boolean }>).map(
            ({ key, label, placeholder, multiline }) => (
              <View key={key} style={styles.field}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TextInput
                  style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
                  placeholder={placeholder}
                  value={String(form[key] ?? '')}
                  onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                  multiline={multiline}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            ),
          )}

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Süre (dakika)</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="60"
              keyboardType="numeric"
              value={String(form.durationMinutes ?? '')}
              onChangeText={(v) =>
                setForm((f) => ({ ...f, durationMinutes: parseInt(v, 10) || 0 }))
              }
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity
            style={[styles.toggleRow, form.isPremium && styles.toggleRowActive]}
            onPress={() => setForm((f) => ({ ...f, isPremium: !f.isPremium }))}
          >
            <Text style={styles.toggleLabel}>Premium içerik</Text>
            <Text style={styles.toggleValue}>{form.isPremium ? 'Evet' : 'Hayır'}</Text>
          </TouchableOpacity>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.btnSecondaryText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveBook}>
              <Text style={styles.btnPrimaryText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 60, paddingTop: Platform.OS === 'ios' ? 60 : 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  deniedTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  deniedSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginHorizontal: 24 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 20 },
  tabBar: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  tabActive: { backgroundColor: '#2563EB' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#FFFFFF' },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  btnSecondary: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    minHeight: 44,
    justifyContent: 'center',
  },
  btnSecondaryText: { color: '#2563EB', fontWeight: '700', fontSize: 14 },
  btnDisabled: { opacity: 0.6 },
  spinner: { marginTop: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardInfo: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  cardSub: { fontSize: 13, color: '#6B7280' },
  cardActions: { gap: 8, alignItems: 'flex-end', marginLeft: 8 },
  editBtn: { fontSize: 13, color: '#2563EB', fontWeight: '600' },
  deleteBtn: { fontSize: 13, color: '#DC2626', fontWeight: '600' },
  premiumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  premiumBadgeText: { fontSize: 11, color: '#92400E', fontWeight: '700' },
  // Modal
  modal: { flex: 1, backgroundColor: '#F9FAFB' },
  modalContent: { padding: 24, paddingBottom: 60 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 20 },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 },
  fieldInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  fieldInputMulti: { height: 80, textAlignVertical: 'top' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    marginBottom: 14,
  },
  toggleRowActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  toggleValue: { fontSize: 15, color: '#6B7280' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
