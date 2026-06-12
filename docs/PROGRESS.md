# PROGRESS.md

> Aktualizuj ten plik po każdej sesji. To jest "pamięć projektu".

## Aktualny status

**Faza:** 7 — Testy  
**Ostatnia sesja:** 2026-06-11  
**Następny krok:** Faza 7 — testy jednostkowe GameEngine + edge case'y usePayments

> Faza 6 w ukończona Część 3: nowa mechanika odpowiedzi (tap + tilt), full-card flash, rotateY flip, konfetti w ResultsView. WordCard przebudowany na responder system (jeden hit-target na cały card, `locationY` decyduje góra/dół). Działa na web, symulatorze i natywnym.

---

## Checklist

### Faza 1 — Fundament

- [x] Expo projekt z TypeScript (`npx create-expo-app`) → `mobile/`
- [x] Struktura folderów zgodna z ARCHITECTURE.md
- [x] EAS CLI skonfigurowane (`eas init`) — do zrobienia po instalacji EAS CLI
- [x] `.env.example` z wszystkimi kluczami (szablon gotowy)
- [x] `config/env.ts` — walidacja zmiennych przy starcie

### Faza 2 — Firebase

- [x] `@react-native-firebase/app` zainstalowane i skonfigurowane
- [x] `config/firebase.ts` — inicjalizacja
- [x] Firebase Auth — anonimowe logowanie działa
- [x] Firebase Auth — Google Sign-In (iOS + Android)
- [x] Firebase Auth — Apple Sign-In (iOS)
- [x] Firestore — zapis postępu gracza
- [x] Firestore — odczyt postępu gracza
- [x] Firestore Security Rules — wdrożone i przetestowane

### Faza 3 — Nawigacja i shared

- [x] Expo Router v4 skonfigurowany (SDK 56 — zastępuje React Navigation v6)
- [x] app/\_layout.tsx: AuthProvider + Stack z typowanymi ekranami
- [x] Ekrany: Home, Game, GameOver, Settings, Store (app/\*.tsx)
- [x] Shared komponenty: Button, Modal, Typography, LoadingScreen (+ testy)
- [x] Theme: colors, spacing, borderRadius, typography

### Faza 4 — Reklamy (AdMob)

- [x] `react-native-google-mobile-ads` zainstalowane
- [x] AdsProvider z inicjalizacją i zgodą (GDPR/ATT)
- [x] BannerAd komponent (test ads, graceful degradation)
- [x] useInterstitialAd hook (test ads)
- [x] useRewardedAd hook (test ads, callback onRewarded)
- [x] Logika: reklamy tylko dla free userów (`isPremium` prop)

### Faza 5 — Płatności (RevenueCat)

- [x] `react-native-purchases` zainstalowane
- [ ] RevenueCat projekt skonfigurowany (iOS + Android) — wymaga konta RevenueCat + kluczy API w `.env`
- [x] PaymentsProvider z inicjalizacją
- [x] `usePayments` hook: isPremium, purchase, restore
- [x] Ekran Store z ofertami
- [x] Restore purchases działa (kod gotowy — wymaga sandbox do przetestowania)
- [ ] Testowe zakupy na sandbox — wymaga EAS dev build + kont testowych

### Faza 6 — Migracja mechaniki gry + Visual Polish

**Część 0 — Mechanika i ekrany:**

- [x] Game engine przepisany 1:1 z web (typy, engine, utils, decks) — czysty JS, bez zależności UI
- [x] 6 talii przetłumaczonych na PL (Filmy, Zwierzęta, Sport, Jedzenie, Znane osoby, Czynności)
- [x] `useGame` hook (adapter engine → React state), `useSettings` hook (AsyncStorage persistence)
- [x] Komponenty gry: `TimerRing`, `WordCard`, `DeckCard`, `ResultsView`
- [x] Wszystkie ekrany: Home, Decks, Game (ready/countdown/playing/paused/results), Settings, Store

**Część 1 — Polish kosmetyczny:**

- [x] `GradientBackground` — ciemny gradient kosmiczny na wszystkich ekranach
- [x] 3-warstwowy 3D bevel button system: kolorowe tint-bevel (formuła: top = 40% white + kolor, bottom = 60% kolor) + convex depth overlay — zastosowany wszędzie (przyciski, DeckCard, duration chips, PackageBtn, title badge)
- [x] `PageHeader` — title badge animowany od góry przy każdym focusie ekranu (`useFocusEffect`), convex bevel na icon buttons (⚙️/←/🔊), SVG chevron zamiast ← tekstu
- [x] `MuteButton` — convex glass bevel, `shadow+clip` pattern (outer View: shadow; inner TouchableOpacity: overflow:hidden)
- [x] `settingsStore.ts` — singleton pub/sub: MuteButton i Settings synchronizują się na żywo bez reload
- [x] `DeckCard` — `computeBevel(hex)`: dynamiczne tint-bevele z dowolnego koloru talii, usunięty accent strip
- [x] WordCard fullscreen — HUD overlays pozycjonowane absolutnie (timer góra, score+controls dół), `pointerEvents="box-none"` — strefy tap góra/dół działają przez HUD
- [x] Animacje wejścia (utility `makeEntranceAnim`/`startEntranceAll`): sekcje od dołu ze spring bounce na każdym ekranie; karty w Decks od lewej z opóźnieniem 100ms; ResultsView `AnimatedItem` spring bounce
- [ ] Dźwięki (`expo-av`) — SFX: click-button/correct/skip/game-over/countdown; respektuj `soundEnabled` — deferred do Fazy 8
- [ ] Gra przetestowana na fizycznym urządzeniu (wymaga EAS dev build)

**Część 2 — Reużywalny UI system:**

- [x] `src/game-engine/store/settingsStore.ts` — `createSettingsStore<T>()`: generyczny pub/sub store z AsyncStorage
- [x] `src/game-engine/ui/` — `createUseSettings(store)` factory hook, barrel re-eksporty theme i komponentów
- [x] `src/game-engine/index.ts` — główny barrel z inline doc "jak zbudować nową grę w < 1 dzień"
- [x] `src/game/{store,hooks}/` — WordRush instancje używające factory; backward-compat re-exports ze starych ścieżek
- [x] Wibracje — `WordCard.vibrationEnabled` prop + last-5s haptic tick respektują `settings.vibrationEnabled`
- [x] `ARCHITECTURE.md` — zaktualizowany: sekcja game-engine, schemat folderów, instrukcja nowej gry

**Część 3 — Poprawa mechaniki odpowiedzi + UI:**

- [x] Nowa mechanika: tap góra/dół LUB przechylenie telefonu (góra = DOBRZE, dół = PAS) — oba jednocześnie; `expo-sensors` Accelerometer, 600ms startup delay, guard `y < -0.3`
- [x] Full-card flash (zielony/pomarańczowy) przed flipem — `Animated.View` absoluteFill overlay
- [x] WordCard — rotateY flip: flash → flip out 160ms → swap word na 90° → flip in spring
- [x] Konfetti w ResultsView przy accuracy ≥ 70% (`react-native-confetti-cannon`, delay 400ms)
- [x] WordCard przebudowany: `Animated.View` responder system (jeden hit-target, `locationY` góra/dół) — fix dla Expo web i symulatorów

### Faza 7 — Testy

- [ ] Testy jednostkowe: mechanika gry
- [ ] Testy jednostkowe: hooki (auth, ads, payments)
- [ ] Testy integracyjne: flow zakupu
- [ ] Testy integracyjne: flow reklamy
- [ ] Ręczne testy na iOS + Android

**Dług z Fazy 5 — brakujące testy `usePayments`:**

- [ ] `purchase` rzuca błąd (nie `userCancelled`) → Alert "Błąd zakupu" się pojawia
- [ ] `purchase` z `userCancelled: true` → Alert się NIE pojawia
- [ ] `isPurchasing` jest `true` podczas zakupu, `false` po zakończeniu
- [ ] `restore` gdy entitlement aktywny → Alert "Sukces"
- [ ] `fetchOfferings` gdy API zwraca `null` → `offerings` pozostaje `null`, brak crashu

### Faza 8 — Publikacja

- [ ] Ikona 1024x1024px
- [ ] Splash screen
- [ ] Screenshoty iOS (min. 3 rozmiary)
- [ ] Screenshoty Android (min. 2)
- [ ] Opis gry (PL + EN)
- [ ] Privacy Policy opublikowane (GitHub Pages lub własna domena)
- [ ] EAS Build — production iOS
- [ ] EAS Build — production Android
- [ ] TestFlight — testy beta iOS
- [ ] Google Play Internal Testing
- [ ] Submission — App Store
- [ ] Submission — Google Play

---

## Log sesji

### 2026-06-09 — Faza 1: Setup

- Reorganizacja repo: gra webowa → `web/`, Expo managed workflow w `mobile/`
- Struktura `src/` (core, game, shared, config), `.env.example`, `config/env.ts` z walidacją zmiennych

---

### 2026-06-10 — Faza 2: Firebase

- Auth: anonymous, Google (GoogleSignin), Apple (expo-apple-authentication)
- Firestore: `savePlayerProgress`/`loadPlayerProgress` offline-first, security rules z anti-cheat (+10k/write)
- TypeScript audit: 4 błędy naprawione → 0 errors; Firebase rules wdrożone

---

### 2026-06-10 — Faza 3: Nawigacja + Shared

- Expo Router v4 zamiast React Navigation v6 (SDK 56 nie wspiera v6 bezpośrednio)
- Shared: Button, Typography, Modal, LoadingScreen + 21 testów; theme: colors, spacing, borderRadius
- `jest-expo@56` wymaga Jest 29 (nie 30); `jest.requireMock()` zamiast outer hoisting → udokumentowane

---

### 2026-06-10 — Faza 4: AdMob

- AdsProvider: ATT (iOS) → consent → init; BannerAd, useInterstitialAd, useRewardedAd
- Dynamic `import()` / `require()` dla web-safe bundlingu; graceful degradation w Expo Go
- 13 nowych testów → **38/38** ✅

---

### 2026-06-10 — Faza 5: Płatności (RevenueCat)

- PaymentsProvider, usePayments (purchase + Alert obsługa, restore), ekran Store
- `AdsProviderBridge` łączy isPremium między PaymentsProvider → AdsProvider
- `require()` zamiast `await import()` — konieczne dla poprawnego mockowania w Jest; **48/48** ✅

---

### 2026-06-10 — Faza 6 Część 0: Mechanika gry

- Game engine skopiowany 1:1 z web (czysty JS, zero zależności UI); 6 talii PL
- useGame hook (adapter engine → React state), useSettings (AsyncStorage persistence)
- Komponenty: TimerRing (SVG), WordCard (strefy tap + flip spring + haptics), DeckCard, ResultsView
- Pełny flow gry w `game.tsx`: ready → countdown → playing → paused → results

---

### 2026-06-10 — Faza 6 Część 1a: Visual Overhaul (baza)

- GradientBackground na wszystkich ekranach; TimerRing: pulse loop + glow shadowColor
- WordCard: adaptive sizing (portrait/landscape), LinearGradient glass, flash overlay przy tapie
- DeckCard: LinearGradient tint z koloru talii, spring press anim, PRO badge, lock overlay
- Home: spring entry (emoji + title równocześnie), pulse loop na Zagraj; ResultsView: spring AnimatedItem

---

### 2026-06-11 — Faza 6 Część 1b: Polish kosmetyczny

- 3-warstwowy 3D bevel system (kolorowe tints: top = 40% white + kolor, bottom = 60% kolor) — wszędzie
- PageHeader: SVG chevron ←, convex bevel na icon buttons, title badge animowany od góry (`useFocusEffect`)
- `settingsStore.ts` singleton pub/sub — MuteButton ↔ Settings synchronizują się na żywo
- WordCard fullscreen + HUD overlays absolutne (timer góra, score+controls dół), `pointerEvents="box-none"`
- `computeBevel(hex)` w DeckCard — dynamiczne tint-bevele z dowolnego koloru talii

---

### 2026-06-11 — Faza 6 Część 2: Reużywalny UI system

- `src/game-engine/` — `createSettingsStore<T>()` + `createUseSettings(store)`: generyczny pub/sub store + hook factory
- WordRush instancje w `src/game/{store,hooks}/`; backward-compat re-exports ze starych ścieżek
- `vibrationEnabled` prop w WordCard + last-5s haptic; `ARCHITECTURE.md` zaktualizowany

---

### 2026-06-11 — Faza 6 Część 2 (c.d.): Animacje spring

- `src/shared/animation/entrance.ts` — utility `makeEntranceAnim`/`startEntranceAll`/`entranceStyle`
- Animacje wejścia z spring bounce (fade + translateY) na każdym ekranie, staggered 75ms
- Decks: `SlideCard` — per-karta slide od lewej ze spring bounce, stagger 100ms
- PageHeader title: `useFocusEffect` zamiast `useEffect` — animacja na każdy powrót (fix dla Home)
- ResultsView `AnimatedItem`: `friction 8→6`, `translateY 20→28` — wyraźniejsze odbicie

---

### 2026-06-11 — Faza 6 Część 3: Mechanika odpowiedzi

- `expo-sensors` + `react-native-confetti-cannon` dodane do zależności
- WordCard — nowa sekwencja odpowiedzi: full-card flash (zielony/pomarańczowy) → rotateY flip out 160ms → swap word → flip in spring + fade flash
- WordCard — `Animated.View` responder system: `onStartShouldSetResponder` + `onResponderRelease` z `locationY` (góra = poprawnie, dół = pas); eliminuje problemy z pustymi TouchableOpacity na Expo web
- Accelerometer tilt: `expo-sensors`, y < -0.3 guard (telefon w pionie), z < -0.65 → correct, z > 0.65 → skip; 600ms startup delay
- `ResultsView` — konfetti (`ConfettiCannon`) po 400ms gdy accuracy ≥ 70%
