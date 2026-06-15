# MONETIZATION.md
> Strategia monetyzacji. Jeden plik — pełny plan od technikaliów po UX.

---

## Model monetyzacji

Freemium — gra darmowa z reklamami, opcja usunięcia reklam i odblokowania dodatków.

```
Free tier
  ├── Pełna gra (wszystkie decki free)
  ├── Reklamy banner (ekran wyników)
  ├── Reklamy interstitial (co 2 gry)
  └── Reklamy rewarded (opcjonalne — za nagrodę) [planowane]

Premium tier — jednorazowy zakup premium_lifetime
  ├── Brak reklam
  └── Wszystkie decki odblokowane
```

---

## 1. Reklamy — AdMob

### Typy i kiedy używać

| Typ | Kiedy | Konwersja | UX |
|---|---|---|---|
| Banner | Ekran wyników (ResultsView) | Niska | Nieinwazyjny |
| Interstitial | Co 2 gry (`gamesCompleted % 2 === 0`) | Średnia | Inwazyjny — nie przesadzaj |
| Rewarded | Na żądanie gracza [planowane] | Najwyższa | Najlepszy UX |

### Strategia rewarded ads (planowane)
Gracz sam inicjuje reklamę w zamian za nagrodę:
- "Obejrzyj reklamę → kontynuuj po game over"
- "Obejrzyj reklamę → odblokuj talię na 1 godzinę"

### ID reklam

**Testowe (development):**
```
Banner:        ca-app-pub-3940256099942544/6300978111
Interstitial:  ca-app-pub-3940256099942544/1033173712
Rewarded:      ca-app-pub-3940256099942544/5224354917
```

**Produkcyjne:** uzupełnij w `.env` po utworzeniu aplikacji w AdMob Console.

---

## 2. Płatności — RevenueCat

### Dlaczego RevenueCat a nie bezpośrednio StoreKit / Billing?
- Jedno API dla iOS i Android
- Automatyczna walidacja receipts (bezpieczeństwo)
- Dashboard z analytics
- Darmowy do $2500 MRR

### Produkty do skonfigurowania

| ID produktu | Typ | Cena sugerowana | Opis |
|---|---|---|---|
| `premium_lifetime` | One-time purchase | ~$4.99 | Brak reklam + wszystkie talie |

### Konfiguracja RevenueCat

```typescript
// core/payments/paymentsConfig.ts
export const ENTITLEMENTS = { PREMIUM: 'premium' } as const;
export const PRODUCT_IDS = { PREMIUM_LIFETIME: 'premium_lifetime' } as const;
```

```typescript
// core/payments/PaymentsProvider.tsx
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

export function initializePayments(userId: string) {
  const apiKey = Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS!,
    android: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID!,
  })!;
  Purchases.configure({ apiKey, appUserID: userId });
}
```

---

## 3. UX monetyzacji — jak nie zniechęcić gracza

**Zasady:**
1. **Nie pokazuj reklamy przed 3. poziomem** — daj graczowi wciągnąć się w grę
2. **Interstitial max raz na 90 sekund** — AdMob i tak to wymusza, ale warto wiedzieć
3. **Ofertę premium pokaż po game over** — gracz jest sfrustrowany i bardziej skłonny kupić
4. **Rewarded ad zawsze opcjonalny** — nigdy nie zmuszaj
5. **Przycisk "Kup premium"** widoczny ale nie nachalny — Settings lub Game Over screen

**Przykładowy flow Game Over:**
```
Game Over Screen
  ├── Wynik + nowy rekord (jeśli)
  ├── [Rewarded Ad Button] "Kontynuuj grę (obejrzyj reklamę)"
  ├── [Primary] "Zagraj ponownie"
  └── [Secondary, subtelnie] "WordRushMF Premium — $4.99"
```

---

## 4. Firebase — koszty przy skalowaniu

Darmowy tier (Spark) wystarczy do ~1000 aktywnych graczy dziennie.

| Aktywni gracze/dzień | Szacowane odczyty Firestore | Plan |
|---|---|---|
| < 500 | ~25k/dzień | Spark (darmowy) |
| 500–5000 | ~250k/dzień | Blaze (pay as you go, ~$1–10/mies) |
| > 5000 | > 250k/dzień | Blaze, warto optymalizować zapytania |

**Optymalizacje żeby zostać na darmowym:**
- Zapis postępu tylko przy końcu poziomu (nie co ruch)
- Cache lokalny w AsyncStorage, sync z Firestore tylko przy zmianie
- Leaderboard odświeżaj max raz na 5 minut

**Zawsze ustaw budget alert:**
Firebase Console → Billing → Budgets & Alerts → $5 i $20.

---

## 5. Realistyczne przychody — benchmarki

Dla prostej gry bez płatnego marketingu:

| Miesięczni aktywni gracze | Przychody z reklam | Przychody z IAP (2% konwersja) |
|---|---|---|
| 100 | $2–10 | $4 (2 zakupy × $1.99) |
| 1 000 | $20–100 | $40 |
| 10 000 | $200–1 000 | $400 |
| 100 000 | $2 000–10 000 | $4 000 |

**Wniosek:** Jedna gra to "beer money". Portfolio 5–10 gier = realny dochód pasywny.
