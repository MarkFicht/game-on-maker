# PROMPTS.md

> Gotowe prompty do wklejenia na początku każdej sesji Claude Code w VS Code.
> Zawsze zaczynaj od "Prompt startowego", potem wybierz prompt dla aktualnego zadania.

---

## PROMPT STARTOWY — wklej na początku KAŻDEJ sesji

```
Jesteś senior React Native developerem. Pracujemy razem nad projektem —
mobilną grą w React Native + Expo z Firebase, AdMob i RevenueCat.

Zanim cokolwiek zrobisz, przeczytaj:
- @docs/ARCHITECTURE.md   ← struktura projektu i zasady
- @docs/PROGRESS.md       ← co już zrobione i co robimy dziś

Po przeczytaniu potwierdź: na jakim etapie jesteśmy i jaki jest następny krok. Jeśli trzeba, zadaj pytania pomocnicze.
```

---

## FAZA 1 — Setup projektu

```
Zaczynamy Fazę 1 z PROGRESS.md.

Stwórz nowy projekt Expo + TypeScript zgodnie z @docs/ARCHITECTURE.md:
1. Komendy: create-expo-app, eas init
2. Struktura folderów src/{core,game,shared,config}
3. config/env.ts z walidacją zmiennych środowiskowych
4. .env.example z wszystkimi kluczami (bez wartości)
5. .gitignore: .env, google-services.json, GoogleService-Info.plist
6. Placeholder index.ts w każdym folderze

Na końcu zaktualizuj @docs/PROGRESS.md.
```

---

## FAZA 2 — Firebase Auth + Firestore

```
Robimy Fazę 2 z PROGRESS.md.

Zaimplementuj w src/core/auth/ i src/core/storage/:
1. AuthProvider + useAuth + authHelpers (anonymous, Google, Apple, signOut)
2. savePlayerProgress / loadPlayerProgress (offline-first, AsyncStorage → Firestore)
3. firestore.rules z walidacją i anti-cheat (max +10k score/write)
4. Testy jednostkowe zgodnie z @docs/TESTING.md

Sprawdź @docs/SECURITY.md przed implementacją.
```

---

## FAZA 3 — Nawigacja + Shared

```
Robimy Fazę 3 z PROGRESS.md.

Skonfiguruj Expo Router v4 i stwórz shared komponenty w src/shared/:
1. app/_layout.tsx — root Stack z AuthProvider
2. Placeholder ekrany: index, game, settings, store
3. Theme: colors.ts, spacing.ts, typography.ts
4. Komponenty: Button (warianty + loading), Typography, Modal, LoadingScreen
5. Testy jednostkowe dla komponentów

Expo Router v4 — użyj file-based routing (nie React Navigation v6).
```

---

## FAZA 4 — Reklamy AdMob

```
Robimy Fazę 4 z PROGRESS.md i @docs/MONETIZATION.md.

Zaimplementuj src/core/ads/:
1. AdsProvider — ATT (iOS) → GDPR consent → init; graceful degradation (web/Expo Go)
2. useRewardedAd, useInterstitialAd — load/show lifecycle, no-op gdy isPremium
3. BannerAd — render-nothing gdy brak reklamy

Zawsze sprawdź isPremium zanim pokażesz reklamę.
Test ad IDs w __DEV__, produkcyjne z .env.
Napisz testy z zamockowanym SDK.
```

---

## FAZA 5 — Płatności RevenueCat

```
Robimy Fazę 5 z PROGRESS.md i @docs/MONETIZATION.md.

Zaimplementuj src/core/payments/:
1. paymentsConfig.ts — ENTITLEMENT_ID, OFFERING_ID, getRevenueCatApiKey()
2. PaymentsProvider — inicjalizacja RC, getCustomerInfo, listener
3. usePayments — isPremium, fetchOfferings, purchase (+ Alert błędy), restore

Wymagania:
- isPremium zawsze z CustomerInfo (nie lokalny stan)
- Restore purchases — wymagany przycisk (Apple Policy)
- require() zamiast await import() — konieczne dla poprawnego mockowania w Jest

Napisz testy z zamockowanym react-native-purchases.
```

---

## FAZA 6 — Migracja mechaniki gry

```
Robimy Fazę 6 z PROGRESS.md.

Mam grę w React (web). Kod do migracji:
[TUTAJ WKLEJ SWÓJ KOD REACT]

Zadanie:
1. engine.ts + types.ts + utils.ts — skopiuj logikę 1:1 (czysty JS, zero UI)
2. useGame hook — adapter engine → React state
3. Komponenty gry w src/game/components/ (RN + StyleSheet zamiast HTML/CSS)
4. Pełny flow w app/game.tsx: ready → countdown → playing → paused → results
5. Użyj shared/animation/entrance.ts dla animacji wejścia sekcji (spring bounce)
6. Testy dla engine.ts zgodnie z @docs/TESTING.md

Zasada: logika gry musi być identyczna z web — zmieniamy tylko warstwę prezentacji.
```

---

## FAZA 7 — Testy

```
Robimy Fazę 7 z PROGRESS.md.

Napisz testy jednostkowe zgodnie z @docs/TESTING.md:
1. src/game/engine.ts — pełne pokrycie mechaniki gry
2. src/hooks/useGame.ts — stany: idle/playing/paused/finished, markCorrect, markSkipped
3. Spłata długu z Fazy 5 — brakujące przypadki usePayments:
   - purchase rzuca błąd (nie userCancelled) → Alert "Błąd zakupu" się pojawia
   - purchase z userCancelled: true → Alert się NIE pojawia
   - isPurchasing: true podczas zakupu, false po zakończeniu
   - restore gdy entitlement aktywny → Alert "Sukces"
   - fetchOfferings gdy API zwraca null → offerings: null, brak crashu

Frameworki: jest-expo + @testing-library/react-native.
```

---

## FAZA 8 — Build produkcyjny

```
Robimy Fazę 8 z PROGRESS.md.

Przygotuj projekt do publikacji:
1. Sprawdź @docs/SECURITY.md — "Checklist przed buildem"
2. eas.json — profile: development, preview, production
3. app.json — bundleIdentifier, versionCode, permissions
4. Babel plugin transform-remove-console dla produkcji
5. Komendy EAS Build dla iOS i Android
6. Instrukcja TestFlight i Google Play Internal Testing
```

---

## BUGFIXING

```
Mam błąd w projekcie React Native + Expo.

Kontekst: @docs/ARCHITECTURE.md

Błąd:
[WKLEJ PEŁNY BŁĄD Z TERMINALA / LOGCAT / XCODE]

Plik: [ŚCIEŻKA]
Kod: [FRAGMENT]

Środowisko:
- Expo SDK: [wersja]
- Platform: iOS / Android / oba
- Urządzenie: emulator / fizyczne
```

---

## CODE REVIEW

```
Zrób code review zgodnie z zasadami projektu.

Sprawdź pod kątem:
1. @docs/ARCHITECTURE.md — brak importów Firebase/AdMob poza core/
2. TypeScript strict — brak any, pełne typy
3. Testy zgodnie z @docs/TESTING.md
4. isPremium sprawdzane przed reklamami
5. vibrationEnabled sprawdzane przed expo-haptics

Kod: [WKLEJ KOD]
```
