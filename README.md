# 1 Saatte 1 Kitap

Kitap özetlerini sesli dinleyebileceğiniz React Native mobil uygulaması.

## Özellikler

- Kitap özetlerini dinle (Expo AV ile ses oynatma)
- Kişisel kütüphane
- **Free Tier:** Her kitap başlamadan önce 2 reklam (Google AdMob)
- **Premium:** Aylık 49,90 ₺ veya Yıllık 499,90 ₺ (RevenueCat)

## Teknoloji Stack

| Alan | Teknoloji |
|------|-----------|
| Framework | React Native + Expo SDK 52 |
| Routing | Expo Router (file-based) |
| Language | TypeScript (strict mode) |
| State | Zustand |
| Server State | React Query |
| Audio | Expo AV |
| Backend | Supabase |
| Video | YouTube Data API v3 |
| IAP | RevenueCat |
| Ads | Google AdMob |

## Kurulum

### Gereksinimler

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- iOS: Xcode 16+ (macOS)
- Android: Android Studio

### Adımlar

```bash
# Repoyu klonla
git clone <repo-url>
cd 1saatte1kitap

# Bağımlılıkları kur
npm install --legacy-peer-deps

# Ortam değişkenlerini ayarla
cp .env.example .env.local
# .env.local dosyasını kendi değerlerinizle doldurun

# Geliştirme sunucusunu başlat
npx expo start

# iOS simülatörde aç
npx expo start --ios

# Android emülatörde aç
npx expo start --android
```

## Proje Yapısı

```
src/
  app/
    _layout.tsx          # Root layout (QueryClient, providers)
    (tabs)/
      _layout.tsx        # Tab bar layout
      index.tsx          # Ana Sayfa - kitap listesi
      library.tsx        # Kütüphanem
      settings.tsx       # Ayarlar & abonelik
  components/            # Yeniden kullanılabilir UI bileşenleri
  hooks/                 # Custom React hooks
  stores/                # Zustand stores
    authStore.ts         # Kullanıcı & abonelik state
    playerStore.ts       # Ses oynatıcı state
  services/              # API servisleri
    supabase.ts          # Supabase client
    booksApi.ts          # Kitap CRUD işlemleri
    youtubeApi.ts        # YouTube Data API
  types/                 # TypeScript type tanımları
  utils/                 # Yardımcı fonksiyonlar
  constants/             # Sabit değerler (fiyatlar, ID'ler)
assets/                  # Görseller (icon, splash)
```

## Ortam Değişkenleri

`.env.example` dosyasına bakın ve `.env.local` oluşturun:

| Değişken | Açıklama |
|----------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase proje URL'i |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonim API anahtarı |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | RevenueCat iOS public key |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | RevenueCat Android public key |
| `EXPO_PUBLIC_YOUTUBE_API_KEY` | YouTube Data API v3 anahtarı |

## Build (EAS)

```bash
# EAS'e giriş yap
eas login

# Preview build (internal testing)
eas build --profile preview --platform ios
eas build --profile preview --platform android

# Production build
eas build --profile production --platform all

# App Store / Play Store'a gönder
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

## AdMob Test ID'leri

Geliştirme sırasında Google'ın test ID'leri kullanılmaktadır:
- iOS App ID: `ca-app-pub-3940256099942544~1458002511`
- Android App ID: `ca-app-pub-3940256099942544~3347511713`

Production için `src/constants/index.ts` dosyasındaki değerleri gerçek ID'lerle güncelleyin.

## Lisans

© 2024 Eryaprak. Tüm hakları saklıdır.
