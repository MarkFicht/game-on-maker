# WordRush — Roadmapa do store

> Ostatnia aktualizacja: czerwiec 2026

---

## Stan projektu

### Co działa
- Gameplay loop, timer, wyniki
- Animacje (spring, sway, 3D bevel buttons)
- Dźwięki (expo-audio), haptika
- Rotacja ekranu podczas gry
- Premium system (RevenueCat) — kod gotowy, **niety­stowany w sandbox**
- Blokowanie talii premium
- Interstitial reklamy co 2 gry (TestIds na emulatorze)
- Infrastruktura Banner + Rewarded Ad (zbudowana, **nieu­mieszczona**)
- Web app z Privacy Policy (placeholder → do uzupełnienia)

### Co NIE zostało przetestowane
- RevenueCat sandbox zakupy
- Firebase Auth (anonymous login persistence)
- Firestore (zapis/odczyt danych)
- AdMob na produkcji (tylko TestIds)
- ATT consent flow (iOS)
- GDPR/UMP consent flow (Android EU)

---

## Blokery store

Bez tych punktów Google Play lub App Store odrzuci apkę.

### 1. Privacy Policy + Terms of Service
**Status: Gotowe**

- [x] Privacy Policy w apce (`mobile/app/privacy.tsx`) — pełna treść PL
- [x] Terms of Service w apce (`mobile/app/terms.tsx`) — pełna treść PL
- [x] Settings linkuje do tych screenów przez `router.push` (bez przeglądarki)
- [x] Statyczne HTML w `docs/legal/` dla GitHub Pages (wymagany URL przy submicie)
- [ ] Włączyć GitHub Pages — repo → Settings → Pages → Source: Deploy from branch → main → /docs
- [ ] Po włączeniu URL-e będą aktywne:
      Privacy: https://markficht.github.io/game-on-maker/legal/privacy.html
      Terms:   https://markficht.github.io/game-on-maker/legal/terms.html
- [ ] Wkleić URL privacy do Google Play Console i App Store Connect przy submicie

### 2. ATT Prompt (iOS)
Wymagany od iOS 14.5 — bez tego AdMob nie może pokazywać spersonalizowanych reklam i konto AdMob grozi zawieszeniem.

- [ ] `npx expo install expo-tracking-transparency`
- [ ] Wywołać `requestTrackingPermissionsAsync()` w `AdsProvider.tsx` przed `MobileAds().initialize()`
- [ ] Dodać do `app.json`:
  ```json
  "ios": {
    "infoPlist": {
      "NSUserTrackingUsageDescription": "WordRush uses this to show relevant ads and support the free version."
    }
  }
  ```

### 3. GDPR/UMP Consent
Jeśli masz użytkowników z EU — wymagane przez Google Play Policy i AdMob.

- [ ] Sprawdzić `AdsProvider.tsx` — czy Google UMP SDK (`react-native-google-mobile-ads` consent) jest wywołane
- [ ] Przetestować na urządzeniu z locale EN-GB lub DE
- [ ] Jeśli UMP nie jest zaimplementowane — dodać `ConsentForm` z `react-native-google-mobile-ads/consent`

### 4. App icon + splash screen
- [ ] Ikona 1024×1024 PNG (bez przezroczystości — wymóg iOS)
- [ ] Adaptive icon dla Android (foreground + background osobno)
- [ ] Splash screen
- [ ] Sprawdzić `app.json`: pola `icon`, `splash`, `android.adaptiveIcon`

### 5. Metadata w sklepach
- [ ] Google Play: opis PL + EN, min. 2 screenshoty (zalecane 8), kategoria → Word Games / Party Games
- [ ] App Store: opis (170 znaków featured text), słowa kluczowe (100 znaków max), screenshoty dla każdego rozmiaru
- [ ] Age rating: 4+ (jeśli dodasz deck 18+ — zmień na 17+/Mature)
- [ ] Content rating questionnaire w Google Play Console

---

## Do przetestowania

### Firebase Auth
```
[ ] AAuthProvider init — brak błędów w logcat/console
[ ] Anonimowy UID tworzony przy pierwszym uruchomieniu
[ ] UID persystuje po zamknięciu i restarcie apki
[ ] Firebase Console → Authentication → widać users
```

### Firestore
```
[ ] Sprawdzić src/core/storage/firestore.ts — co zapisuje
[ ] Firebase Console → Firestore → Rules — czy są bezpieczne reguły
    (domyślne reguły wygasają po 30 dniach od stworzenia projektu!)
[ ] Przetestować zapis danych na emulatorze
[ ] Przetestować odczyt danych po restarcie apki
```
Bezpieczne reguły minimum:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### RevenueCat (zakupy)
```
[ ] RevenueCat dashboard — stworzony produkt "premium" z ENTITLEMENT_ID = 'premium'
[ ] Sandbox testers skonfigurowane (App Store Connect + Google Play Console)
[ ] .env — EXPO_PUBLIC_REVENUECAT_API_KEY_IOS i _ANDROID wypełnione
[ ] fetchOfferings() zwraca pakiety (nie null)
[ ] Zakup sandbox → isPremium zmienia się na true
[ ] Talie premium odblokowane po zakupie
[ ] restorePurchases() po reinstalacji → premium wraca
[ ] Brak reklam po zakupie premium (canShowAds = false)
```

### AdMob
```
[ ] Konto AdMob → Apps → stworzono aplikację → skopiowano App ID
[ ] .env — EXPO_PUBLIC_ADMOB_APP_ID_ANDROID i _IOS wypełnione
[ ] Stworzono Interstitial Ad Unit → ID do .env (EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID)
[ ] Stworzono Banner Ad Unit → ID do .env (EXPO_PUBLIC_ADMOB_BANNER_ID)
[ ] TestIds działają na emulatorze (interstitial po 2. grze)
[ ] Produkcyjne IDs przetestowane na fizycznym urządzeniu
[ ] AdMob App ID wpisane też w app.json (android.googleServicesFile lub bezpośrednio)
```

### Banner reklama (do zaimplementowania)
`BannerAd` komponent istnieje w `src/core/ads/` ale nie jest nigdzie użyty.
```
[ ] Wstawić BannerAd w ResultsView — pod przyciskami, widoczny dla free users
[ ] Sprawdzić czy BannerAd znika dla premium (canShowAds = false)
```

---

## Feature roadmap

### Sprint 1 — Szybkie wygrane (po store submit)

| Feature | Gdzie | Czas |
|---|---|---|
| "Oceń nas" prompt po 3. grze | `game.tsx` — po `gamesCompleted === 3` | 15 min |
| Banner w results screen | `ResultsView.tsx` — pod przyciskami | 30 min |
| Rewarded ad: +30 sekund | `game.tsx` — przycisk w HUD | 2 godz |
| Firebase Analytics (events) | `src/core/analytics/index.ts` — jest pusty | 2 godz |

### Sprint 2 — Więcej contentu

Aktualne decki: 4 free + 2 premium = za mało. Cel: 4 free + 8-10 premium.

Propozycje nowych talii:
```
Free (zostają):    🎬 Filmy  🦁 Zwierzęta  🍕 Jedzenie  ⚽ Sport
Premium (nowe):    🎵 Muzyka i artyści
                   🏙️ Miejsca na świecie
                   👔 Zawody i profesje
                   🎮 Gry video
                   🏛️ Historia świata
                   🇵🇱 Polska (patriotyczny deck)
                   🔬 Nauka i wynalazki
                   🎭 Bajki i animacje
```

Każdy deck — minimum 40 słów (aktualnie niektóre mają tylko 15).

### Sprint 3 — Killer features

**Headband mode** (pochylasz telefon zamiast tapować)
- `expo-sensors` → `DeviceMotion`
- Pochylenie do przodu > 30° = poprawnie
- Pochylenie do tyłu > 30° = pomiń
- Odróżnia apkę od konkurencji (Heads Up!, Activity)

**Tryb wieloosobowy (turowy)**
- Ekran startowy: wybierasz liczbę graczy (2-6) + imiona
- Po każdej turze: wyniki gracza → następny gracz
- Ekran końcowy: ranking z wynikami wszystkich

**Historia wyników**
- Local high score per deck w AsyncStorage
- Widoczne na ekranie wyboru talii (twój rekord: X)

**Onboarding (pierwsze uruchomienie)**
- 3-ekranowy swipe tutorial: Pokaż → Zgadnij → Oceń
- `AsyncStorage` flag `onboarding_done` — pokazuje się tylko raz

### Sprint 4 — Jakość produkcyjna

- Sentry dla crash reportingu (`sentry-expo`)
- OTA updates — sprawdzić `expo-updates` konfigurację w `eas.json`
- i18n — angielska wersja językowa (wymagana do skalowania poza PL)
- Dark/light mode support (choć apka już jest dark-only)

---

## Checklist przed submitem

```
TECHNIKALIA
[ ] Fizyczne urządzenie iOS — przejście przez każdy screen
[ ] Fizyczne urządzenie Android — przejście przez każdy screen
[ ] Zero crashy w logcat podczas 10-minutowej sesji
[ ] Offline mode — apka nie crashuje bez internetu

ZAKUPY I REKLAMY
[ ] Zakup premium (sandbox) → talie odblokowane + brak reklam
[ ] Przywrócenie zakupów → premium wraca
[ ] Interstitial po 2. grze (free user)
[ ] Brak interstitial dla premium
[ ] Banner w results (free user) — jeśli zaimplementowany

LINKI I LEGAL
[ ] Settings → Polityka prywatności → otwiera https://wordrush.app/privacy
[ ] Settings → Regulamin → otwiera https://wordrush.app/terms
[ ] Obie strony mają realną treść

STORE
[ ] Screenshoty oddają prawdziwy wygląd apki
[ ] Opis nie zawiera obietnic których nie spełniasz
[ ] Age rating odpowiada zawartości
```

---

## Znane problemy / techniczny dług

| Problem | Plik | Notatka |
|---|---|---|
| `src/core/analytics/index.ts` | Pusty plik | Placeholder — Firebase Analytics niezaimplementowane |
| `@react-native-async-storage/async-storage` w devDependencies | `package.json` | Powinno być w `dependencies` |
| `gamesCompleted` to zmienna modułowa | `app/game.tsx` | Resetuje się przy restarcie apki — OK dla reklam |
| Decks mają tylko 15 słów | `src/game/decks.ts` | Za mało dla party game |
