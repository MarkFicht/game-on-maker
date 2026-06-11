# ARCHITECTURE.md

> Przeczytaj ten plik na początku każdej nowej sesji Claude Code.

## Cel projektu

Boilerplate dla mobilnych mini-gier — React (web) przepisany na React Native + Expo.
Architektura podzielona tak, żeby przy każdej nowej grze zmieniać TYLKO folder `src/game/`.
Cała infrastruktura (auth, płatności, reklamy, storage) zostaje bez zmian i jest kopiowana 1:1.

---

## Stack techniczny

| Warstwa          | Technologia                                     |
| ---------------- | ----------------------------------------------- |
| Framework        | Expo SDK 56 (managed workflow)                  |
| Język            | TypeScript (strict mode)                        |
| Nawigacja        | Expo Router v4 (file-based)                     |
| State management | Własny pub/sub store (`createSettingsStore<T>`) |
| Backend          | Firebase — Auth + Firestore                     |
| Reklamy          | AdMob (react-native-google-mobile-ads)          |
| Płatności        | RevenueCat (react-native-purchases v7)          |
| Sensory          | expo-sensors (Accelerometer — tilt detection)   |
| Efekty           | react-native-confetti-cannon                    |
| Testy            | Jest + React Native Testing Library             |
| Build / deploy   | EAS Build + EAS Submit                          |

---

## Struktura folderów

```
src/
├── game-engine/                   ← WARSTWA REUŻYWALNA — kopiowana 1:1 do nowych gier
│   ├── store/
│   │   └── settingsStore.ts       ← createSettingsStore<T>() — generyczny pub/sub store
│   └── ui/
│       ├── theme/
│       │   └── index.ts           ← re-eksport z src/shared/theme (colors, spacing, borderRadius, typography)
│       ├── components/
│       │   └── index.ts           ← re-eksport: Button, GradientBackground, MuteButton, PageHeader
│       ├── hooks/
│       │   ├── useSettings.ts     ← createUseSettings(store) — factory hook dla dowolnych ustawień
│       │   └── index.ts
│       └── index.ts               ← główny barrel: import { Button, colors, createUseSettings } from 'game-engine/ui'
│
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
│   │   └── storageTypes.ts        ← typy PlayerData, GameSettings, LeaderboardEntry
│   └── analytics/
│       ├── analytics.ts           ← Firebase Analytics eventy
│       └── analyticsEvents.ts     ← stałe nazw eventów
│
├── game/                          ← TYLKO TO zmieniasz przy nowej grze
│   ├── engine.ts                  ← główna logika gry (czysty JS/TS, bez UI)
│   ├── types.ts                   ← typy specyficzne dla tej gry
│   ├── utils.ts                   ← helpersy mechaniki
│   ├── decks.ts                   ← talie kart / dane gry
│   ├── store/
│   │   └── settingsStore.ts       ← instancja createSettingsStore dla tej gry
│   ├── hooks/
│   │   ├── useGame.ts             ← adapter engine → React state
│   │   └── useSettings.ts         ← createUseSettings(store) dla tej gry
│   └── components/
│       └── [komponenty UI gry]    ← TimerRing, WordCard, DeckCard, ResultsView itp.
│
├── shared/
│   ├── animation/
│   │   └── entrance.ts            ← makeEntranceAnim / startEntranceAll / entranceStyle (spring bounce)
│   ├── components/
│   │   ├── Button.tsx             ← 3D bevel button (engine-level)
│   │   ├── GradientBackground.tsx ← background wrapper (engine-level)
│   │   ├── MuteButton.tsx         ← toggle dźwięku (engine-level)
│   │   ├── PageHeader.tsx         ← transparentny header (engine-level)
│   │   ├── Modal.tsx              ← app-level modal
│   │   ├── LoadingScreen.tsx      ← app-level loader
│   │   └── Typography.tsx         ← app-level typografia
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
├── _layout.tsx                    ← root layout: AuthProvider + PaymentsProvider + Stack
├── index.tsx                      ← Home screen
├── decks.tsx                      ← Deck selection screen
├── game.tsx                       ← Game screen (ready/countdown/playing/paused/results)
├── settings.tsx                   ← Settings screen
└── store.tsx                      ← Store / paywall screen

docs/
├── ARCHITECTURE.md
├── PROGRESS.md
├── PROMPTS.md
├── MONETIZATION.md
├── SECURITY.md
└── TESTING.md
```

---

## Jak zbudować nową grę na tym silniku (< 1 dzień)

1. **Skopiuj całe repo** — `core/`, `shared/`, `game-engine/`, `app/` i konfiguracja zostają bez zmian.
2. **Wyczyść `src/game/`** i zastąp swoją logiką:
   - `engine.ts` + `types.ts` + `utils.ts` — czysty TS, bez zależności UI
   - `decks.ts` (lub odpowiednik) — dane gry
   - `store/settingsStore.ts`:
     ```ts
     import { createSettingsStore } from "../../game-engine/store/settingsStore";
     export const settingsStore = createSettingsStore(
       DEFAULT_SETTINGS,
       "myGame_settings",
     );
     ```
   - `hooks/useSettings.ts`:
     ```ts
     import { createUseSettings } from "../../game-engine/ui/hooks/useSettings";
     export const useSettings = createUseSettings(settingsStore);
     ```
   - `hooks/useGame.ts` — adapter engine → React state
   - `components/` — komponenty UI specyficzne dla gry
3. **Dostosuj ekrany** `app/` do flow swojej gry.
4. **Import UI z `game-engine/`**:
   ```ts
   import {
     Button,
     GradientBackground,
     PageHeader,
     MuteButton,
     colors,
     spacing,
   } from "../src/game-engine/ui";
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
4. **Jeden store na grę** — `createSettingsStore()` w `game/store/settingsStore.ts`, stan nie jest rozrzucony po komponentach.
5. **Offline first** — gra działa bez internetu, synchronizacja z Firestore przy połączeniu.
6. **Reklamy tylko dla free userów** — zawsze sprawdzaj `isPremium` przed pokazaniem reklamy.
7. **Wibracje przez `vibrationEnabled`** — zawsze sprawdzaj ustawienie przed wywołaniem `expo-haptics`.
8. **Touch na kartach przez responder system** — `onStartShouldSetResponder` + `onResponderRelease` na `Animated.View`; `locationY` decyduje o strefie. Nie używaj `TouchableOpacity` jako hit-area gdy masz nakładające się absolutne overlaye (psuje się na Expo web).

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
EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=

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

| Typ                | Format           | Przykład           |
| ------------------ | ---------------- | ------------------ |
| Komponenty         | PascalCase.tsx   | `GameScreen.tsx`   |
| Hooki              | useCamelCase.ts  | `useRewardedAd.ts` |
| Helpery            | camelCase.ts     | `authHelpers.ts`   |
| Typy / interfejsy  | PascalCase       | `PlayerData`       |
| Stałe              | UPPER_SNAKE_CASE | `MAX_LIVES`        |
| Eventy analityczne | snake_case       | `level_complete`   |
