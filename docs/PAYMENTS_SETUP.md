# Konfiguracja płatności — krok po kroku

> Google Play Console + RevenueCat + kod. Jeden raz, na zawsze.

---

## 1. Google Play Console — produkt IAP

**Play Console → (aplikacja) → Zarabianie → Produkty kupowane raz → Utwórz**

| Pole | Wartość |
|---|---|
| ID produktu | `premium_lifetime` |
| Identyfikator opcji zakupu | `premium-lifetime` |
| Nazwa | WordRushMF Premium |
| Opis | Brak reklam + wszystkie talie |
| Cena | ~19,99 PLN |

Zapisz → zmień status na **Aktywny**.

---

## 2. Google Cloud Console — konto usługi (JSON key)

> Projekt: ten sam co Firebase (`plated-client-491815-q9`)

1. `console.cloud.google.com`
2. **Interfejsy API i usługi → Biblioteka** → włącz **Google Play Android Developer API**
3. **IAM i administrator → Konta usług → Utwórz konto usługi**
   - Nazwa: `revenuecat`
   - Uprawnienia: pomiń (kliknij Kontynuuj → Gotowe)
4. Kliknij w konto `revenuecat` → **Klucze → Dodaj klucz → Utwórz nowy klucz → JSON**
5. Pobierz plik `.json` — to jest Twój klucz do RevenueCat

---

## 3. Google Play Console — nadaj uprawnienia kontu usługi

**Play Console → Użytkownicy i uprawnienia → Zaprosić nowych użytkowników**

- Email: adres konta usługi (`revenuecat@plated-client-491815-q9.iam.gserviceaccount.com`)
- Uprawnienia: zaznacz **Finanse** (Wyświetlaj dane finansowe, zamówienia...)
- Kliknij Zastosuj → Zaproś użytkownika

---

## 4. RevenueCat — konfiguracja

1. Utwórz konto na `app.revenuecat.com`
2. **New Project → WordRushMF**
3. Dodaj aplikację Android:
   - Package name: `com.wordrushmf.game`
   - **Google Play License Key** → wklej klucz RSA z Play Console
     *(Play Console → aplikacja → Zarabianie → Konfiguracja ustawień zarabiania → Klucz publiczny RSA)*
   - **Service Account credentials** → wgraj pobrany plik `.json`
4. **Products → New Product**
   - ID: `premium_lifetime`
   - Type: Non-consumable
5. **Entitlements → New Entitlement**
   - ID: `premium`
   - Przypisz produkt `premium_lifetime`
6. **Offerings → New Offering**
   - ID: `default`
   - Dodaj package z `premium_lifetime`

---

## 5. Kod — wpisz klucz RevenueCat do .env

```
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=appl_xxx
```

Klucz znajdziesz w RevenueCat → Project Settings → API Keys → Public app-specific key (Android).

---

## 5b. Znane ograniczenie — service account JSON

"Dostęp do API" w Play Console jest niedostępny dla kont bez opublikowanej aplikacji produkcyjnej. Pomiń ten krok teraz — RevenueCat działa w trybie sandbox bez niego. Wróć do tego po pierwszej publikacji:

1. Play Console → Konfiguracja → Dostęp do API → Połącz z Google Cloud
2. Nadaj kontu usługi `revenuecat@plated-client-491815-q9.iam.gserviceaccount.com` dostęp
3. Wgraj JSON w RevenueCat → Apps → WordRushMF → Service Account Credentials

---

## 6. Testowanie zakupów (sandbox)

**Play Console → Ustawienia → Testowanie licencji**

Dodaj swój e-mail Google do listy testerów licencji — zakupy będą darmowe w trybie sandbox.

Na urządzeniu: zalogowany tym samym kontem Google → zakup w apce → pojawi się okno Google Play z informacją "to jest zakup testowy".

---

## Klucze RSA do zachowania

```
Play Console → aplikacja → Zarabianie → Konfiguracja ustawień zarabiania
→ Klucz publiczny RSA (pole "Licencje")
```

Zapisz ten klucz — potrzebny przy konfiguracji RevenueCat i przy ewentualnym przenoszeniu projektu.
