# WordRushMF — Roadmapa

> Aktualizacja: czerwiec 2026

---

## Gdzie jesteśmy

**Google Play Console** → jesteś w formularzu **"Utwórz domyślną stronę aplikacji"**.

Zrobione: konto ✅ → aplikacja `com.wordrushmf.game` ✅ → preview APK wgrany ✅ → formularz finansowy ✅ → RevenueCat (produkt+JSON) ✅ → AdMob (App ID + Interstitial/Banner) ✅

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
[x] Konto usługi dodane jako użytkownik konta dewelopera (Konto dewelopera → Użytkownicy i uprawnienia →
    Zaprosić użytkowników, uprawnienie Finanse) — UWAGA: strona "Dostęp do API" w Ustawieniach już nie
    istnieje, to nie wymaga produkcyjnego wydania
[x] JSON klucza wgrany w RevenueCat → Apps → WordRushMF → Service Account Credentials
[x] RevenueCat: produkt premium_lifetime → entitlement "premium" → offering "default"
[x] .env → EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID
```

### 4. Prawdziwe IDs AdMob
```
[x] admob.google.com → aplikacja WordRushMF → App ID → app.json (androidAppId)
[x] Interstitial + Banner Ad Units → .env
[ ] Rewarded Ad Unit — pomiń, niewpięty w UI (status "planowane" w MONETIZATION.md)
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
