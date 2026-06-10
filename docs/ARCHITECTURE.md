# ARCHITECTURE.md
> Przeczytaj ten plik na początku każdej nowej sesji Claude Code.

## Cel projektu
Boilerplate dla mobilnych mini-gier — React (web) przepisany na React Native + Expo.
Architektura podzielona tak, żeby przy każdej nowej grze zmieniać TYLKO folder `src/game/`.
Cała infrastruktura (auth, płatności, reklamy, storage) zostaje bez zmian i jest kopiowana 1:1.

---

## Stack techniczny

| Warstwa | Technologia |
|---|---|
| Framework | Expo SDK 51+ (managed workflow) |
| Język | TypeScript (strict mode) |
| Nawigacja | Expo Router v4 (file-based, SDK 56) |
| State management | Zustand v4 |
| Backend | Firebase — Auth + Firestore |
| Reklamy | AdMob (react-native-google-mobile-ads) |
| Płatności | RevenueCat (react-native-purchases v7) |
| Testy | Jest + React Native Testing Library |
| Build / deploy | EAS Build + EAS Submit |

---

## Struktura folderów

```
src/
├── core/                          ← NIE RUSZAĆ przy nowych grach
│   ├── auth/
│   │   ├── AuthProvider.tsx       ← Context + Firebase Auth
│   │   ├── useAuth.ts             ← hook: user, signIn, signOut
│   │   └── authHelpers.ts         ← anonymous, Google, Apple login
│   ├── ads/
│   │   ├── AdsProvider.tsx        ← inicjalizacja AdMob, consent
│   │   ├── useRewardedAd.ts       ← hook: załaduj i pokaż rewarded ad
│   │   ├── useInterstitialAd.ts   ← hook: ad między poziomami
│   │   └── BannerAd.tsx           ← komponent banera
│   ├── payments/
│   │   ├── PaymentsProvider.tsx   ← RevenueCat init
│   │   ├── usePayments.ts         ← hook: isPremium, purchase, restore
│   │   └── paymentsConfig.ts      ← ID produktów per platforma
│   ├── storage/
│   │   ├── firestore.ts           ← save/load postępu gracza
│   │   ├── localStorage.ts        ← AsyncStorage wrapper
│   │   └── storageTypes.ts        ← typy PlayerData, Settings itp.
│   └── analytics/
│       ├── analytics.ts           ← Firebase Analytics eventy
│       └── analyticsEvents.ts     ← stałe nazw eventów
│
├── game/                          ← TYLKO TO zmieniasz przy nowej grze
│   ├── mechanics/
│   │   ├── gameEngine.ts          ← główna logika gry
│   │   ├── gameStore.ts           ← Zustand store dla stanu gry
│   │   ├── gameTypes.ts           ← typy specyficzne dla tej gry
│   │   └── gameUtils.ts           ← helpersy mechaniki
│   ├── screens/
│   │   ├── GameScreen.tsx
│   │   ├── GameOverScreen.tsx
│   │   └── LevelSelectScreen.tsx
│   └── components/
│       └── [komponenty UI gry]
│
├── shared/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── Typography.tsx
│   ├── navigation/
│   │   └── index.ts               ← AppRoute type (Expo Router zarządza nawigacją przez app/)
│   └── theme/
│       ├── colors.ts
│       ├── spacing.ts
│       ├── typography.ts
│       └── index.ts
│
└── config/
    ├── firebase.ts                ← inicjalizacja Firebase
    ├── env.ts                     ← walidacja zmiennych środowiskowych
    └── constants.ts               ← stałe aplikacji

app/                               ← Expo Router — ekrany (file-based routing)
├── _layout.tsx                    ← root layout: AuthProvider + Stack
├── index.tsx                      ← Home screen
├── game.tsx                       ← Game screen
├── game-over.tsx                  ← GameOver screen
├── settings.tsx                   ← Settings screen
└── store.tsx                      ← Store screen

docs/
├── ARCHITECTURE.md
├── PROGRESS.md
├── PROMPTS.md
├── MONETIZATION.md
├── SECURITY.md
└── TESTING.md
```

---

## Przepływ danych przy starcie aplikacji

```
App Start
  ↓
Walidacja .env (config/env.ts)
  ↓
Firebase Auth → anonimowe UID (lub Google / Apple)
  ↓
Firestore → załaduj postęp gracza
  ↓
RevenueCat → sprawdź status premium
  ↓
AdMob → inicjalizacja tylko jeśli NIE premium
  ↓
Game Loop
  ↓
Level Complete → zapisz postęp → pokaż ad (jeśli nie premium)
```

---

## Kluczowe zasady

1. **core/ jest nietykalny** — kod z `game/` nigdy nie importuje Firebase, AdMob ani RevenueCat bezpośrednio. Tylko przez hooki z `core/`.
2. **Klucze API tylko przez .env** — nigdy hardcoded, nigdy w repozytorium.
3. **TypeScript strict** — zakaz używania `any`.
4. **Jeden store na grę** — Zustand w `game/mechanics/gameStore.ts`, stan nie jest rozrzucony po komponentach.
5. **Offline first** — gra działa bez internetu, synchronizacja z Firestore przy połączeniu.
6. **Reklamy tylko dla free userów** — zawsze sprawdzaj `isPremium` przed pokazaniem reklamy.

---

## Zmienne środowiskowe (.env)

```bash
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

# AdMob
EXPO_PUBLIC_ADMOB_APP_ID_IOS=
EXPO_PUBLIC_ADMOB_APP_ID_ANDROID=
EXPO_PUBLIC_ADMOB_REWARDED_ID=
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID=
EXPO_PUBLIC_ADMOB_BANNER_ID=

# RevenueCat
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=
```

---

## Konwencje nazewnictwa

| Typ | Format | Przykład |
|---|---|---|
| Komponenty | PascalCase.tsx | `GameScreen.tsx` |
| Hooki | useCamelCase.ts | `useRewardedAd.ts` |
| Helpery | camelCase.ts | `authHelpers.ts` |
| Typy / interfejsy | PascalCase | `PlayerData` |
| Stałe | UPPER_SNAKE_CASE | `MAX_LIVES` |
| Eventy analityczne | snake_case | `level_complete` |
