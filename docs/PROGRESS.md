# PROGRESS.md

> Aktualizuj ten plik po każdej sesji. To jest "pamięć projektu".

## Aktualny status

**Faza:** 8 — Publikacja (w toku)
**Ostatnia sesja:** 2026-06-25
**Następny krok:** Dokończyć stronę sklepu w Play Console (grafika: ikona 512×512, feature graphic, screenshoty)

---

## Checklist

### Faza 1 — Fundament

- [x] Expo projekt z TypeScript (`npx create-expo-app`) → `mobile/`
- [x] Struktura folderów zgodna z ARCHITECTURE.md
- [x] EAS CLI skonfigurowane (`eas init`)
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

- [x] Expo Router v4 skonfigurowany (SDK 56)
- [x] `app/_layout.tsx`: AuthProvider + Stack z typowanymi ekranami
- [x] Ekrany: Home, Game, GameOver, Settings, Store (`app/*.tsx`)
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
- [x] PaymentsProvider z inicjalizacją
- [x] `usePayments` hook: isPremium, purchase, restore
- [x] Ekran Store z ofertami
- [x] Restore purchases działa (kod gotowy — wymaga sandbox do przetestowania)

### Faza 6 — Mechanika gry + Visual Polish

- [x] Game engine przepisany 1:1 z web (czysty JS, bez zależności UI)
- [x] 6 talii przetłumaczonych na PL (Filmy, Zwierzęta, Sport, Jedzenie, Znane osoby, Czynności)
- [x] `useGame` hook, `useSettings` hook (AsyncStorage persistence)
- [x] Komponenty gry: `TimerRing`, `WordCard`, `DeckCard`, `ResultsView`
- [x] Wszystkie ekrany: Home, Decks, Game (ready/countdown/playing/paused/results), Settings, Store
- [x] `GradientBackground` — ciemny gradient na wszystkich ekranach
- [x] 3-warstwowy 3D bevel button system — zastosowany wszędzie
- [x] `PageHeader` — title badge animowany (`useFocusEffect`), SVG chevron, convex bevel na buttonach
- [x] `MuteButton` — convex glass bevel, shadow+clip pattern
- [x] `settingsStore.ts` — singleton pub/sub: MuteButton ↔ Settings synchronizacja na żywo
- [x] `DeckCard` — `computeBevel(hex)`: dynamiczne tint-bevele z koloru talii
- [x] WordCard fullscreen — HUD overlays absolutne (timer góra, score+controls dół), `pointerEvents="box-none"`
- [x] Animacje wejścia (`makeEntranceAnim`/`startEntranceAll`): spring bounce na każdym ekranie
- [x] WordCard — tap góra/dół + przechylenie telefonu (Accelerometer, 600ms delay, y < -0.3 guard)
- [x] WordCard — full-card flash → rotateY flip out → swap word na 90° → flip in spring
- [x] Konfetti w ResultsView przy accuracy ≥ 70% (delay 400ms)
- [x] Dźwięki — `expo-audio` (SFX: click/correct/skip/gameover/countdown); `useSoundManager` hook

### Faza 7 — Testy

- [x] Testy jednostkowe: engine (46), utils (16), auth, ads, payments + edge case'y
- [x] Testy integracyjne: flow zakupu (6), flow reklamy (11)
- [x] **142/142 ✅**, tsc 0 błędów
- [ ] Ręczne testy na iOS + Android (fizyczne urządzenie)

### Faza 8 — Publikacja

**Kod i konfiguracja:**
- [x] `expo-av` → `expo-audio` (fix silent crash na Androidzie — LazyKType error)
- [x] `@react-native-async-storage/async-storage` przeniesione do `dependencies` (było w devDependencies)
- [x] `expo-store-review` dodane do `dependencies`
- [x] `SafeAreaView` → `react-native-safe-area-context` we wszystkich screenach (Android edge-to-edge fix)
- [x] Interstitial co 2 gry + "Oceń nas" po 3. grze łącznie (1x na zawsze, AsyncStorage)
- [x] Fix licznika "Oceń nas" — teraz inkrementuje na każdej grze (nie tylko nieparzystych)
- [x] Banner ad w ResultsView dla free users
- [x] In-app Privacy Policy + Terms ekrany (PL), linkowane z Settings przez `router.push`
- [x] HTML na GitHub Pages (`docs/legal/` → branch `gh-pages`)
- [x] Wszystkie `WordRush` → `WordRushMF` w kodzie i UI (AsyncStorage keys: `wordrushmf_`)
- [x] Ghost sound fix — `stopAll()` przed `playGameOver()` + `pause()` przed `remove()` w cleanup
- [x] WordCard flip fix — 16ms `setTimeout` przy -90° żeby React zdążył wyrenderować nowe słowo
- [x] PageHeader title badge — `paddingTop: 4` (label niżej, buttony bez zmian)
- [x] Home title letter spacing: `1` (było `-1.5`)
- [x] Start button — emoji 🎮 rozdzielony od tekstu `fontSize: 28` (jak `playIcon` na Home)
- [x] Fix: dźwięk correct/skip odtwarzał się przy wyborze talii z ekranu decks po zakończonej grze — `disabled` prop na `WordCard` + `setGamePhase('ready')`+`reset()` w `handleCancel`/`handleHome` przed nawigacją
- [x] Custom `AppSplashScreen` — animowany loading screen zamiast natywnego: to samo tło co w apce, duże logo odkrywane lewo→prawo + pasek skanujący maskowany do konturu logo (`react-native-svg` na native, CSS `mask-image` na web), % progresu, preload `bg`+`logo` przez `expo-asset` przed startem animacji; `AppReadyContext` synchronizuje entrance-animację Home z końcem splasha

**Google Play Console:**
- [x] Konto dewelopera założone i zweryfikowane
- [x] Aplikacja `com.wordrushmf.game` stworzona
- [x] Preview APK zbudowany (`eas build --platform android --profile preview`) i wgrany do Internal Testing
- [x] Formularz finansowy (`Funkcje finansowe w aplikacji`) wypełniony
- [ ] Strona sklepu — ikona 512×512, feature graphic 1024×500, min. 2 screenshoty, opis
- [ ] Produkt `premium_lifetime` w Produkty kupowane raz
- [ ] Content rating questionnaire
- [ ] Produkcyjny build + submit

**RevenueCat + AdMob:**
- [x] RevenueCat: produkt `premium_lifetime` + entitlement `premium` + offering `default` skonfigurowane
- [x] `.env` → `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=goog_xxx`
- [x] RevenueCat: service account JSON — `revenuecat@plated-client-491815-q9.iam.gserviceaccount.com` dodane jako użytkownik w Play Console (Użytkownicy i uprawnienia, uprawnienie Finanse) + JSON wgrany w RevenueCat (Service Account Credentials). Nie był potrzebny żaden "Dostęp do API" ani produkcyjne wydanie — wcześniejsza notatka o blokadzie była błędna/nieaktualna.
- [x] AdMob: prawdziwe App ID → `app.json`; Interstitial + Banner Ad Units → `.env` (Rewarded ID pozostaje `TODO_FILL_LATER` — niewpięty w UI, "planowane")
- [ ] Testowe zakupy na sandbox (fizyczne urządzenie z kontem na liście License Testers)

**Testy przed submitem:**
- [ ] Zakup premium sandbox → talie odblokowane + brak reklam
- [ ] Restore purchases → premium wraca
- [ ] Firebase Auth — UID widoczny w Firebase Console po uruchomieniu
- [ ] Firestore rules — sprawdzić datę wygaśnięcia (30 dni od stworzenia projektu!)
- [ ] Offline mode — apka nie crashuje bez internetu
- [ ] Zero crashy podczas 10-minutowej sesji na urządzeniu z aktualnym GPS

---

## Znane problemy / dług techniczny

| Problem | Notatka |
|---|---|
| Crash na Huawei P30 Lite | GPS v22.5 za stary (wymaga v25.24) → WebView GPU crash (SIGSEGV CrGpuMain) przy AdMob. NIE bug kodu — aktualizacja GPS na telefonie rozwiązuje. Na produkcji nie wystąpi. |
| Firestore nigdy nie wywoływany | `savePlayerProgress`/`loadPlayerProgress` istnieją ale żaden screen ich nie wywołuje. Decyzja: zostawić pod przyszły leaderboard albo usunąć. |
| Firebase Analytics | `src/core/analytics/index.ts` jest pusty — placeholder, niezaimplementowane |
| Decks mają ~15 słów | Za mało dla party game — minimum 40 per deck (Sprint 2) |
| `gamesCompleted` to zmienna modułowa | Resetuje się przy restarcie apki — OK dla reklam (licznik AsyncStorage jest persystowany) |

---

## Log sesji

### 2026-06-09 — Faza 1: Setup
Reorganizacja repo: gra webowa → `web/`, Expo managed workflow → `mobile/`. Struktura `src/`, `.env.example`, `config/env.ts` z walidacją zmiennych.

### 2026-06-10 — Faza 2: Firebase
Auth: anonymous, Google (GoogleSignin), Apple (expo-apple-authentication). Firestore: `savePlayerProgress`/`loadPlayerProgress` offline-first, security rules z anti-cheat. TypeScript audit: 0 errors.

### 2026-06-10 — Faza 3: Nawigacja + Shared
Expo Router v4 zamiast React Navigation v6 (SDK 56). Shared: Button, Typography, Modal, LoadingScreen + 21 testów. `jest-expo@56` wymaga Jest 29; `jest.requireMock()` zamiast outer hoisting.

### 2026-06-10 — Faza 4: AdMob
AdsProvider: ATT (iOS) → consent → init. BannerAd, useInterstitialAd, useRewardedAd. Dynamic `import()` dla web-safe bundlingu. **38/38 ✅**

### 2026-06-10 — Faza 5: Płatności (RevenueCat)
PaymentsProvider, usePayments (purchase + Alert, restore), ekran Store. `AdsProviderBridge` łączy isPremium → AdsProvider. `require()` zamiast `await import()` (hoist problem w Jest). **48/48 ✅**

### 2026-06-10 — Faza 6 cz. 0: Mechanika gry
Game engine 1:1 z web (czysty JS). useGame + useSettings hooki. Komponenty: TimerRing (SVG), WordCard (tap+flip+haptics), DeckCard, ResultsView. Pełny flow gry w `game.tsx`.

### 2026-06-10–11 — Faza 6 cz. 1–3: Visual Polish
3D bevel system, GradientBackground, PageHeader (SVG chevron, useFocusEffect), MuteButton, settingsStore pub/sub. WordCard fullscreen + HUD overlays. Animacje wejścia spring na każdym ekranie. WordCard: flash → rotateY flip → swap → spring. Accelerometer tilt. Konfetti ≥70%.

### 2026-06-11 — Faza 6 cz. 2: Reużywalny UI system
`createSettingsStore<T>()` + `createUseSettings(store)` factory. Backward-compat re-exports. `vibrationEnabled` w WordCard + last-5s haptic. ARCHITECTURE.md zaktualizowany.

### 2026-06-12 — Faza 7: Testy + Cleanup
Cleanup: usunięto backward-compat shimy, martwy `game-over.tsx`, zduplikowane stałe. Testy: engine (46), utils (16), payments edge cases (5), integracyjne AdMob (11) + RevenueCat (6). **142/142 ✅**, tsc 0 błędów.

### 2026-06-14–15 — Faza 8: Store prep + poprawki wizualne
Wszystkie zmiany z checklisty Fazy 8 powyżej. Crash P30 Lite zdiagnozowany (GPS outdated, nie bug kodu). Google Play Console: konto → app → preview APK → formularz finansowy. Stworzono `docs/ROADMAP.md` jako skondensowany plan publikacji.

### 2026-06-16 — Faza 8: Grafiki, ikony, IAP + RevenueCat
Logo `logo_home.png` wstawiony na home screen (zastąpił emoji 🎯). Przygotowano grafiki: `logo_app_512.png` (512×512, ikona Play Store), `android-icon-monochrome.png` (432×432), `feature_graphic_1024x500.png`, `favicon_48.png`. Dodano `react-native-purchases` BILLING permission do `app.json` + profil `preview-store` (AAB) do `eas.json`. Wgrano AAB do Internal Testing — odblokował się IAP. Stworzono produkt `premium_lifetime` w Play Console. RevenueCat: produkt + entitlement `premium` + offering `default` skonfigurowane, klucz API wpisany do `.env`. Service account JSON zablokowany (Play Console "Dostęp do API" niedostępne przed publikacją produkcyjną). Stworzono `docs/PAYMENTS_SETUP.md` jako przewodnik krok po kroku.

### 2026-06-25 — Faza 8: Custom splash screen + sound bug fix
**Fix:** dźwięk correct/skip odtwarzał się przy wybraniu talii z ekranu decks po zakończonej grze (race condition — `WordCard` nie był jeszcze odmontowany w momencie nawigacji). Naprawione trzema zmianami: `disabled` prop na `WordCard` sprawdzany w `triggerAnswer` przed ustawieniem `isAnimating.current`, `setGamePhase('ready')` w `handleCancel` (odmontowuje `WordCard` przed `router.back()`), `reset()` w `handleHome` przed `router.replace('/')`.

**Custom `AppSplashScreen`** (`src/shared/components/AppSplashScreen.tsx`) zamiast pustego natywnego ekranu ładowania: to samo tło co w apce, duże logo (270px) przyciemnione i odkrywane animowaną maską od lewej do prawej, pasek skanujący podświetlający dokładnie kontur logo, licznik % postępu. `AppReadyContext` (`src/core/AppReadyContext.ts`) + `SplashGate` w `_layout.tsx` gateują entrance-animację Home (`useFocusEffect`) tak, by odpaliła się dopiero po zniknięciu splasha.

Maskowanie paska skanującego do okrągłego konturu logo (kwadratowy canvas, przezroczyste narożniki) przeszło przez kilka iteracji: zwykły `overflow:hidden` + gradient fade nie nadążał za krzywizną koła → `@react-native-masked-view/masked-view` (jego web shim ignoruje `children` i renderuje tylko `maskElement` — niedziałające na webie) → finalnie `react-native-svg`: `<Mask maskType="alpha">` na native, a na web całe `<Svg>` maskowane przez CSS `mask-image` (bo `<Mask>` w `react-native-svg` zawsze forwarduje `maskType` do realnego DOM `<mask>`, niezależnie co się przekaże — trzeba całkowicie ominąć ten element na webie). Dodatkowo `expo-asset` (`Asset.fromModule(...).downloadAsync()`) do preloadu `bg`+`logo` przed startem animacji — `Image.resolveAssetSource`/`prefetch` nie wystarczają, bo `react-native-web` nie implementuje `resolveAssetSource`.

### 2026-06-25 — Faza 8: AdMob prawdziwe ID + odblokowanie RevenueCat service account
**AdMob:** utworzona aplikacja Android w AdMob Console → App ID `ca-app-pub-3065180504928244~8476416077` wpisany w `app.json` (`androidAppId`). Utworzone Ad Units Interstitial (`.../6756140291`) i Banner (`.../3938405265`) → `.env`. Rewarded Ad Unit pominięty (niewpięty w UI). Kod już wcześniej miał poprawny fallback (`__DEV__` → zawsze TestIds, produkcja → `env.admob.*`), więc realne ID działają tylko w production build.

**RevenueCat service account JSON — odblokowane:** poprzednia notatka "zablokowane, Play Console Dostęp do API niedostępne przed produkcją" była błędna/nieaktualna. Strona "Dostęp do API" w Ustawieniach **już nie istnieje** w Play Console — Google przeniosło to wprost do **Konto dewelopera → Użytkownicy i uprawnienia → Zaprosić nowych użytkowników** (poziom konta, nie wewnątrz aplikacji), gdzie dodaje się e-mail konta usługi z uprawnieniem **Finanse**. Nie wymaga to opublikowanej wersji produkcyjnej. Service account `revenuecat@plated-client-491815-q9.iam.gserviceaccount.com` był już dodany jako aktywny użytkownik z uprawnieniem Finanse, a JSON klucza już wgrany w RevenueCat (Service Account Credentials) — temat faktycznie zamknięty. Zaktualizowano `PAYMENTS_SETUP.md` i `ROADMAP.md`, żeby nie odtwarzać tej (błędnej) blokady w kolejnych sesjach.
