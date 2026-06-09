# PROMPTS.md
> Gotowe prompty do wklejenia na początku każdej sesji Claude Code w VS Code.
> Zawsze zaczynaj od "Prompt startowy", potem wybierz prompt dla aktualnego zadania.

---

## PROMPT STARTOWY — wklej na początku KAŻDEJ sesji

```
Jesteś senior React Native developerem. Pracujemy razem nad projektem — 
mobilną grą w React Native + Expo z Firebase, AdMob i RevenueCat.

Zanim cokolwiek zrobisz, przeczytaj te pliki z repozytorium:
- @docs/ARCHITECTURE.md   ← struktura projektu i zasady
- @docs/PROGRESS.md       ← co już zrobione i co robimy dziś
- @docs/SECURITY.md       ← zasady bezpieczeństwa których przestrzegamy
- @docs/TESTING.md        ← jak piszemy testy

Po przeczytaniu potwierdź:
1. Na jakim etapie jesteśmy (z PROGRESS.md)
2. Jaki jest następny krok
3. Czy masz pytania zanim zaczniemy

Czekam na potwierdzenie zanim dam Ci zadanie.
```

---

## FAZA 1 — Setup projektu

```
Zaczynamy Fazę 1 z PROGRESS.md.

Zadanie: Stwórz nowy projekt Expo z TypeScript i przygotuj 
pełną strukturę folderów zgodną z @docs/ARCHITECTURE.md.

Kroki do wykonania:
1. Wygeneruj komendy do uruchomienia w terminalu (create-expo-app, eas init)
2. Stwórz strukturę folderów src/core, src/game, src/shared, src/config
3. Stwórz plik config/env.ts z walidacją zmiennych środowiskowych
4. Stwórz .env.example z wszystkimi wymaganymi kluczami (bez wartości)
5. Zaktualizuj .gitignore o .env, google-services.json, GoogleService-Info.plist
6. Stwórz placeholder index.ts w każdym folderze żeby struktura była widoczna

Po każdym pliku — zatrzymaj się i zapytaj czy kontynuować.
Na końcu zaktualizuj @docs/PROGRESS.md.
```

---

## FAZA 2 — Firebase Auth

```
Robimy Firebase Auth z @docs/PROGRESS.md.

Stack: react-native-firebase, TypeScript strict, Expo managed workflow.

Zadanie: Zaimplementuj pełny system autoryzacji w src/core/auth/:
1. AuthProvider.tsx — Context z user, isLoading, error
2. useAuth.ts — hook eksportujący stan i metody
3. authHelpers.ts — funkcje: signInAnonymously, signInWithGoogle, 
   signInWithApple, signOut, linkAnonymousWithGoogle

Wymagania:
- Anonimowe logowanie przy pierwszym uruchomieniu (zero friction)
- Google Sign-In jako opcja "Zapisz postęp"
- Apple Sign-In (wymagane przez Apple jeśli mamy Google)
- Obsługa błędów z czytelnymi komunikatami
- TypeScript — brak any, pełne typy
- JSDoc dla każdej funkcji publicznej

Napisz też testy jednostkowe dla useAuth zgodnie z @docs/TESTING.md.
Sprawdź @docs/SECURITY.md przed implementacją.
```

---

## FAZA 3 — Firestore (storage)

```
Robimy integrację Firestore z @docs/PROGRESS.md.

Zadanie: Zaimplementuj warstwę storage w src/core/storage/:
1. storageTypes.ts — typy: PlayerData, GameSettings, LeaderboardEntry
2. firestore.ts — funkcje: savePlayerProgress, loadPlayerProgress, 
   updateLeaderboard, getTopLeaderboard(limit: number)
3. localStorage.ts — AsyncStorage wrapper z typami dla offline cache

Wymagania:
- Offline first: zawsze najpierw czytaj z AsyncStorage, sync z Firestore w tle
- Obsługa błędów sieciowych bez crashowania gry
- Firestore Security Rules w pliku firestore.rules (zgodne z @docs/SECURITY.md)
- Testy dla Firestore Security Rules (assertFails / assertSucceeds)
- Walidacja danych przed zapisem (score >= 0, level >= 1)

Pokaż też jak uruchomić Firebase Emulator do testów lokalnych.
```

---

## FAZA 4 — Reklamy AdMob

```
Robimy integrację AdMob z @docs/PROGRESS.md i @docs/MONETIZATION.md.

Zadanie: Zaimplementuj system reklam w src/core/ads/:
1. AdsProvider.tsx — inicjalizacja AdMob, GDPR consent (Europa), 
   ATT permission (iOS), kontekst czy reklamy są gotowe
2. useRewardedAd.ts — hook: load(), show(), isLoaded, isEarningReward
3. useInterstitialAd.ts — hook: load(), show(), isLoaded
4. BannerAd.tsx — komponent z fallback gdy reklama nie załadowana

Wymagania:
- Zawsze sprawdź isPremium zanim pokażesz reklamę
- Consent flow PRZED inicjalizacją (GDPR + ATT)
- Test ad IDs w development, produkcyjne z .env
- Obsługa błędów (brak internetu, failed to load)
- Częstotliwość interstitial: co 3 poziomy, nie częściej niż co 90s

Napisz testy z zamockowanym AdMob SDK.
Sprawdź @docs/SECURITY.md sekcję "Reklamy — compliance".
```

---

## FAZA 5 — Płatności RevenueCat

```
Robimy integrację RevenueCat z @docs/PROGRESS.md i @docs/MONETIZATION.md.

Zadanie: Zaimplementuj system płatności w src/core/payments/:
1. paymentsConfig.ts — ENTITLEMENTS, PRODUCT_IDS (z MONETIZATION.md)
2. PaymentsProvider.tsx — inicjalizacja RevenueCat z userId z Firebase Auth
3. usePayments.ts — hook: isPremium, packages, purchase(packageId), 
   restorePurchases, isLoading, error

Wymagania:
- Inicjalizuj RevenueCat dopiero PO zalogowaniu użytkownika Firebase
- isPremium zawsze z CustomerInfo (nie z lokalnego stanu)
- Restore purchases — wymagany przycisk (Apple Policy)
- Obsługa błędów: user cancelled, payment failed, network error
- Sandbox testing instructions w komentarzu

Napisz testy z zamockowanym react-native-purchases.
Sprawdź @docs/SECURITY.md sekcję "Płatności — bezpieczeństwo".
```

---

## FAZA 6 — Migracja mechaniki gry

```
Robimy migrację gry z @docs/PROGRESS.md.

Mam istniejącą grę w React (web). Wklejam poniżej kod do migracji:

[TUTAJ WKLEJ SWÓJ KOD REACT]

Zadanie:
1. Przeanalizuj kod i wskaż co trzeba zmienić (div→View, CSS→StyleSheet itp.)
2. Stwórz gameStore.ts z Zustand (stan gry zamiast lokalnego useState)
3. Przepisz główny komponent gry na React Native
4. Zachowaj całą logikę w gameEngine.ts (czyste funkcje, zero UI)
5. Użyj react-native-reanimated dla animacji

Zasada: logika gry (gameEngine.ts) musi być identyczna — 
zmieniamy tylko warstwę prezentacji.
Napisz testy dla gameEngine zgodnie z @docs/TESTING.md.
```

---

## FAZA 8 — Build produkcyjny

```
Robimy build produkcyjny z @docs/PROGRESS.md.

Zadanie: Przygotuj projekt do publikacji na App Store i Google Play.

1. Sprawdź @docs/SECURITY.md — "Checklist przed buildem produkcyjnym"
2. Skonfiguruj eas.json dla profili: development, preview, production
3. Skonfiguruj app.json: bundleIdentifier, versionCode, permissions
4. Dodaj babel plugin transform-remove-console dla produkcji
5. Wygeneruj komendy EAS Build dla iOS i Android
6. Napisz instrukcję TestFlight i Google Play Internal Testing

Przed buildem upewnij się że:
- Wszystkie test ad IDs zastąpione prawdziwymi
- .env.production skonfigurowane
- Firestore Rules wdrożone na produkcję
```

---

## PROMPT DO BUGFIXINGU — użyj gdy napotkasz błąd

```
Mam błąd w projekcie React Native + Expo.

Kontekst projektu: @docs/ARCHITECTURE.md

Błąd:
[WKLEJ PEŁNY BŁĄD Z TERMINALA / LOGCAT / XCODE]

Plik w którym wystąpił:
[WKLEJ ŚCIEŻKĘ]

Kod:
[WKLEJ FRAGMENT KODU]

Środowisko:
- Expo SDK: [wersja]
- Platform: iOS / Android / oba
- Urządzenie: emulator / fizyczne

Proszę o:
1. Wyjaśnienie przyczyny błędu
2. Konkretne rozwiązanie z kodem
3. Czy jest to błąd który może pojawić się w innych miejscach?
```

---

## PROMPT DO CODE REVIEW — przed każdym większym commitem

```
Zrób code review następującego kodu zgodnie z zasadami projektu.

Sprawdź pod kątem:
1. Zasady z @docs/ARCHITECTURE.md (szczególnie: brak importów Firebase/AdMob poza core/)
2. Security z @docs/SECURITY.md (klucze API, Firestore rules, anti-cheat)
3. TypeScript strict — brak any, pełne typy
4. Czy są testy? Czy spełniają wymagania z @docs/TESTING.md?
5. Performance — niepotrzebne re-rendery, wyciek pamięci
6. Czy monetyzacja respektuje isPremium przed reklamami?

Kod do review:
[WKLEJ KOD]
```
