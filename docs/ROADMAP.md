# WordRushMF — Roadmapa

> Aktualizacja: czerwiec 2026

---

## Gdzie jesteśmy

**Google Play Console** → jesteś w formularzu **"Utwórz domyślną stronę aplikacji"**.

Zrobione: konto ✅ → aplikacja `com.wordrushmf.game` ✅ → preview APK wgrany ✅ → formularz finansowy ✅

---

## Następne kroki (w kolejności)

### 1. Dokończ stronę sklepu (teraz)
Potrzebujesz grafiki — resztę tekstu masz poniżej:

| Grafika | Rozmiar |
|---|---|
| Ikona | 512×512 PNG, bez przezroczystości |
| Feature graphic | 1024×500 PNG |
| Screenshoty | min. 2, min. 1080px szerokości |

**Krótki opis:** `Party word game — describe the word before time runs out!`

**Privacy Policy URL:** `https://markficht.github.io/game-on-maker/legal/privacy.html`

> ⚠️ Żeby URL działało: GitHub → repo → Settings → Pages → Branch: `gh-pages` → / → Save

### 2. Stwórz produkt `premium_lifetime`
Play Console → Zarabianie → Produkty kupowane raz → Utwórz

| Pole | Wartość |
|---|---|
| ID produktu | `premium_lifetime` |
| Nazwa | WordRushMF Premium |
| Cena | ~4,99 USD |

### 3. RevenueCat
```
[ ] Play Console → Konfiguracja → Dostęp do API → konto usługi → pobierz JSON → wgraj do RevenueCat
[ ] RevenueCat: dodaj produkt premium_lifetime → entitlement "premium" → offering
[ ] .env → EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID="appl_xxx"
```

### 4. Prawdziwe IDs AdMob
```
[ ] admob.google.com → utwórz aplikację → skopiuj App ID → app.json
[ ] Utwórz Interstitial + Banner Ad Units → .env
```

### 5. Content rating + produkcyjny build
```
[ ] Play Console → Content rating → wypełnij kwestionariusz
[ ] npx eas build --platform android --profile production
[ ] Submit
```

---

## Rzeczy do przetestowania przed submitem

```
[ ] Zakup premium sandbox → talie odblokowane + brak reklam
[ ] Restore purchases → premium wraca
[ ] Interstitial po 2. grze
[ ] Firebase Auth — UID w Firebase Console po uruchomieniu
[ ] Firestore rules — sprawdzić datę wygaśnięcia (30 dni od stworzenia projektu!)
[ ] Offline — apka nie crashuje bez internetu
[ ] Crash na urządzeniu z aktualnym GPS (P30 Lite ma za stary GPS — nie testuj na nim)
```

---

## Feature roadmap (po submicie)

**Sprint 2 — content:** więcej talii, min. 40 słów per deck (aktualnie ~15)
```
Premium (nowe): Muzyka · Miejsca na świecie · Zawody · Gry video
                Historia · Polska · Nauka · Bajki i animacje
```

**Sprint 3 — killer features:**
- Headband mode (przechylasz telefon — `expo-sensors` DeviceMotion)
- Tryb wieloosobowy turowy (2-6 graczy, ranking końcowy)
- Historia wyników per deck (AsyncStorage)
- Onboarding 3-ekranowy (tylko przy pierwszym uruchomieniu)

**Sprint 4 — jakość:** Sentry crash reporting · OTA updates · i18n EN
