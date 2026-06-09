# SECURITY.md
> Zasady bezpieczeństwa obowiązujące w całym projekcie. Sprawdzaj przed każdym PR / buildem produkcyjnym.

---

## 1. Klucze API i sekrety

**Zasada:** żaden klucz API nie trafia do repozytorium.

```bash
# .gitignore — upewnij się że te pliki są ignorowane
.env
.env.local
.env.production
google-services.json       # Firebase Android
GoogleService-Info.plist   # Firebase iOS
```

Wszystkie klucze przez zmienne środowiskowe z prefiksem `EXPO_PUBLIC_`:
```typescript
// config/env.ts — walidacja przy starcie aplikacji
const requiredEnvVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_ADMOB_APP_ID_IOS',
  'EXPO_PUBLIC_REVENUECAT_API_KEY_IOS',
] as const;

export function validateEnv() {
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      throw new Error(`Brakuje zmiennej środowiskowej: ${key}`);
    }
  }
}
```

---

## 2. Firestore Security Rules

**Zasada:** domyślnie wszystko zablokowane, otwieramy tylko to co potrzebne.

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Gracz może czytać i pisać TYLKO swój dokument
    match /players/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null
        && request.auth.uid == userId
        && isValidPlayerData(request.resource.data);
    }

    // Leaderboard: każdy może czytać, pisać tylko swój wpis
    match /leaderboard/{userId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.uid == userId
        && request.resource.data.score is int
        && request.resource.data.score >= 0
        && request.resource.data.score <= 9999999;
    }

    // Wszystko inne — zablokowane
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

// Walidacja struktury danych gracza
function isValidPlayerData(data) {
  return data.keys().hasAll(['score', 'level', 'updatedAt'])
    && data.score is int
    && data.score >= 0
    && data.score <= 9999999
    && data.level is int
    && data.level >= 1
    && data.level <= 1000;
}
```

**Testuj reguły lokalnie:**
```bash
firebase emulators:start
```

---

## 3. Zabezpieczenia przed oszustwami (anti-cheat)

**Nie ufaj danym z klienta.** Kilka warstw ochrony:

```typescript
// ❌ ŹLE — gracz może zmienić dowolny wynik
await firestore().collection('leaderboard').doc(uid).set({ score: userInputScore });

// ✅ DOBRZE — score wyliczany server-side lub walidowany
// Opcja A: Cloud Function waliduje czy wynik jest możliwy
// Opcja B: Firestore Rules ograniczają max wzrost score na raz
```

**Ograniczenie max wzrostu score w jednej sesji (Firestore Rules):**
```javascript
allow write: if request.resource.data.score - resource.data.score <= 10000;
```

**Wrażliwe dane przez expo-secure-store, nie AsyncStorage:**
```typescript
import * as SecureStore from 'expo-secure-store';

// Tokeny, klucze sesji — SecureStore (szyfrowany)
await SecureStore.setItemAsync('userToken', token);

// Postęp gry, ustawienia — AsyncStorage (ok dla nie-wrażliwych)
await AsyncStorage.setItem('settings', JSON.stringify(settings));
```

---

## 4. Reklamy — compliance

**GDPR (Europa) i ATT (iOS 14+) są obowiązkowe.**

```typescript
// Zawsze pytaj o zgodę PRZED inicjalizacją AdMob
import { check, request } from '@react-native-google-mobile-ads';

const consentInfo = await check();
if (consentInfo.isConsentFormAvailable) {
  await request(); // pokaż formularz zgody
}

// iOS — App Tracking Transparency
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
const { status } = await requestTrackingPermissionsAsync();
```

Bez tego Apple odrzuci aplikację, a Google może zawiesić konto AdMob.

---

## 5. Płatności — bezpieczeństwo

```typescript
// Zawsze weryfikuj zakup server-side lub przez RevenueCat webhooks
// NIE ufaj tylko stanowi lokalnemu isPremium

// ✅ RevenueCat automatycznie weryfikuje receipts z Apple/Google
// Używaj CustomerInfo z RevenueCat jako źródło prawdy
const customerInfo = await Purchases.getCustomerInfo();
const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
```

**Restore purchases** musi być dostępne — Apple tego wymaga:
```typescript
// Wymagany przycisk "Przywróć zakupy" w UI
await Purchases.restorePurchases();
```

---

## 6. Obfuskacja kodu

EAS Build w trybie `production` automatycznie:
- Minifikuje i obfuskuje JavaScript (Hermes engine)
- Usuwa console.log
- Optymalizuje bundle

```json
// eas.json
{
  "build": {
    "production": {
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**Usuń wszystkie console.log przed buildem produkcyjnym:**
```typescript
// babel.config.js
module.exports = {
  plugins: [
    ['transform-remove-console', { exclude: ['error', 'warn'] }]
  ]
};
```

---

## 7. Checklist przed buildem produkcyjnym

- [ ] `.env` nie jest w repo (`git status` — sprawdź)
- [ ] `google-services.json` i `GoogleService-Info.plist` w `.gitignore`
- [ ] Firestore Rules wdrożone (`firebase deploy --only firestore:rules`)
- [ ] Test ads zastąpione prawdziwymi ID
- [ ] `console.log` usunięte (babel plugin)
- [ ] GDPR consent flow przetestowany
- [ ] ATT permission przetestowane na iOS
- [ ] Restore purchases przetestowane
- [ ] Privacy Policy URL w app store listing
- [ ] Minimalna wersja iOS: 13.0, Android: API 21
