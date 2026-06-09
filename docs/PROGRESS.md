# PROGRESS.md
> Aktualizuj ten plik po każdej sesji. To jest "pamięć projektu".

## Aktualny status
**Faza:** 1 — Setup  
**Ostatnia sesja:** [data]  
**Następny krok:** Setup projektu Expo + TypeScript

---

## Checklist

### Faza 1 — Fundament
- [ ] Expo projekt z TypeScript (`npx create-expo-app`)
- [ ] Struktura folderów zgodna z ARCHITECTURE.md
- [ ] EAS CLI skonfigurowane (`eas init`)
- [ ] `.env` z wszystkimi kluczami (szablon gotowy)
- [ ] `config/env.ts` — walidacja zmiennych przy starcie

### Faza 2 — Firebase
- [ ] `@react-native-firebase/app` zainstalowane i skonfigurowane
- [ ] `config/firebase.ts` — inicjalizacja
- [ ] Firebase Auth — anonimowe logowanie działa
- [ ] Firebase Auth — Google Sign-In (iOS + Android)
- [ ] Firebase Auth — Apple Sign-In (iOS)
- [ ] Firestore — zapis postępu gracza
- [ ] Firestore — odczyt postępu gracza
- [ ] Firestore Security Rules — wdrożone i przetestowane

### Faza 3 — Nawigacja i shared
- [ ] React Navigation v6 skonfigurowane
- [ ] RootNavigator z typami TypeScript
- [ ] Ekrany: Home, Game, GameOver, Settings, Store
- [ ] Shared komponenty: Button, Modal, Typography, LoadingScreen
- [ ] Theme: kolory, spacing, czcionki

### Faza 4 — Reklamy (AdMob)
- [ ] `react-native-google-mobile-ads` zainstalowane
- [ ] AdsProvider z inicjalizacją i zgodą (GDPR/ATT)
- [ ] Banner ad działa (test ads)
- [ ] Interstitial ad działa (test ads)
- [ ] Rewarded ad działa (test ads)
- [ ] Logika: reklamy tylko dla free userów

### Faza 5 — Płatności (RevenueCat)
- [ ] `react-native-purchases` zainstalowane
- [ ] RevenueCat projekt skonfigurowany (iOS + Android)
- [ ] PaymentsProvider z inicjalizacją
- [ ] `usePayments` hook: isPremium, purchase, restore
- [ ] Ekran Store z ofertami
- [ ] Restore purchases działa
- [ ] Testowe zakupy na sandbox

### Faza 6 — Migracja mechaniki gry
- [ ] Analiza istniejącego kodu React (web)
- [ ] Lista komponentów do przepisania
- [ ] Przepisanie mechaniki na RN primitives
- [ ] Animacje (react-native-reanimated)
- [ ] Dźwięki (expo-av)
- [ ] Gra działa na Android (emulator)
- [ ] Gra działa na iOS (symulator)
- [ ] Gra działa na fizycznym urządzeniu

### Faza 7 — Testy
- [ ] Testy jednostkowe: mechanika gry
- [ ] Testy jednostkowe: hooki (auth, ads, payments)
- [ ] Testy integracyjne: flow zakupu
- [ ] Testy integracyjne: flow reklamy
- [ ] Ręczne testy na iOS + Android

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

### [data sesji]
**Co zrobiono:**
- 

**Problemy napotkane:**
- 

**Decyzje podjęte:**
- 

**Następny krok:**
- 
