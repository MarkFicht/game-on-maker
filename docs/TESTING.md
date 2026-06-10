# TESTING.md
> Strategia testowania projektu. Testy piszemy równolegle z kodem, nie po.

---

## Filozofia testowania

Dla mobilnej gry skupiamy się na trzech warstwach:

```
         /\
        /  \   E2E (Detox) — krytyczne flow: zakup, logowanie
       /────\
      / Integ \  Integracyjne — hooki z Firebase/AdMob/RevenueCat (mock)
     /─────────\
    /  Unit     \  Jednostkowe — mechanika gry, logika biznesowa
   /─────────────\
```

**Priorytet:** Jednostkowe > Integracyjne > E2E  
Im wyżej w piramidzie, tym wolniejsze i droższe w utrzymaniu.

---

## Setup

```bash
# Jest + React Native Testing Library (wbudowane w Expo)
npx expo install jest-expo @testing-library/react-native

# Mockowanie Firebase
npm install --save-dev @firebase/rules-unit-testing

# Opcjonalnie E2E
npm install --save-dev detox
```

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterFramework": ["@testing-library/jest-native/extend-expect"],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

---

## 1. Testy jednostkowe — mechanika gry

To najważniejsza warstwa. Logika gry musi być deterministyczna i testowalna.

```typescript
// src/game/mechanics/__tests__/gameEngine.test.ts

import { calculateScore, isGameOver, nextLevel } from '../gameEngine';

describe('calculateScore', () => {
  it('dodaje punkty za szybkie ukończenie', () => {
    expect(calculateScore({ timeLeft: 30, basePoints: 100 })).toBe(130);
  });

  it('nie daje ujemnych punktów', () => {
    expect(calculateScore({ timeLeft: 0, basePoints: 0 })).toBe(0);
  });

  it('cap na MAX_SCORE', () => {
    expect(calculateScore({ timeLeft: 999, basePoints: 999999 })).toBeLessThanOrEqual(9999999);
  });
});

describe('isGameOver', () => {
  it('kończy grę gdy lives === 0', () => {
    expect(isGameOver({ lives: 0, timeLeft: 10 })).toBe(true);
  });

  it('kończy grę gdy timeLeft === 0', () => {
    expect(isGameOver({ lives: 3, timeLeft: 0 })).toBe(true);
  });

  it('nie kończy gry gdy lives > 0 i timeLeft > 0', () => {
    expect(isGameOver({ lives: 1, timeLeft: 1 })).toBe(false);
  });
});
```

---

## 2. Testy hooków — auth, ads, payments

Mockujemy zewnętrzne serwisy, testujemy logikę hooka.

```typescript
// src/core/auth/__tests__/useAuth.test.ts

import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../useAuth';

// Mock Firebase
jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: () => ({
    signInAnonymously: jest.fn().mockResolvedValue({
      user: { uid: 'test-uid-123' }
    }),
    onAuthStateChanged: jest.fn((callback) => {
      callback({ uid: 'test-uid-123' });
      return jest.fn(); // unsubscribe
    }),
  }),
}));

describe('useAuth', () => {
  it('loguje anonimowo przy starcie', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {});
    expect(result.current.user?.uid).toBe('test-uid-123');
  });

  it('user jest null przed zalogowaniem', () => {
    const { result } = renderHook(() => useAuth());
    // przed resolved promise
    expect(result.current.isLoading).toBe(true);
  });
});
```

```typescript
// src/core/payments/__tests__/usePayments.test.ts

import { renderHook, act } from '@testing-library/react-native';
import { usePayments } from '../usePayments';
import Purchases from 'react-native-purchases';

jest.mock('react-native-purchases');

describe('usePayments', () => {
  it('isPremium false dla nowego użytkownika', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
      entitlements: { active: {} }
    });

    const { result } = renderHook(() => usePayments());
    await act(async () => {});
    expect(result.current.isPremium).toBe(false);
  });

  it('isPremium true po zakupie', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
      entitlements: { active: { premium: { isActive: true } } }
    });

    const { result } = renderHook(() => usePayments());
    await act(async () => {});
    expect(result.current.isPremium).toBe(true);
  });
});
```

---

## 3. Testy komponentów

```typescript
// src/shared/components/__tests__/Button.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renderuje label', () => {
    const { getByText } = render(<Button label="Zagraj" onPress={() => {}} />);
    expect(getByText('Zagraj')).toBeTruthy();
  });

  it('wywołuje onPress po tapnięciu', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Zagraj" onPress={onPress} />);
    fireEvent.press(getByText('Zagraj'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('nie wywołuje onPress gdy disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Zagraj" onPress={onPress} disabled />);
    fireEvent.press(getByText('Zagraj'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

---

## 4. Testy Firestore Security Rules

```typescript
// tests/firestore-rules.test.ts
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

const testEnv = await initializeTestEnvironment({
  projectId: 'test-project',
  firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') }
});

describe('Firestore Security Rules', () => {
  it('gracz może czytać swój dokument', async () => {
    const userDb = testEnv.authenticatedContext('user-123').firestore();
    await assertSucceeds(userDb.collection('players').doc('user-123').get());
  });

  it('gracz nie może czytać cudzego dokumentu', async () => {
    const userDb = testEnv.authenticatedContext('user-123').firestore();
    await assertFails(userDb.collection('players').doc('inny-user').get());
  });

  it('niezalogowany nie może nic czytać', async () => {
    const anonDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(anonDb.collection('players').doc('user-123').get());
  });

  it('score nie może być ujemny', async () => {
    const userDb = testEnv.authenticatedContext('user-123').firestore();
    await assertFails(
      userDb.collection('players').doc('user-123').set({ score: -1, level: 1 })
    );
  });
});
```

---

## 5. Ręczne testy przed publikacją

### iOS (TestFlight)
- [ ] Gra działa na iPhone SE (mały ekran)
- [ ] Gra działa na iPhone 15 Pro Max (duży ekran)
- [ ] Reklamy wyświetlają się poprawnie
- [ ] Zakup premium działa (sandbox)
- [ ] Restore purchases działa
- [ ] ATT permission pojawia się przy pierwszym uruchomieniu
- [ ] Gra działa offline (brak internetu)
- [ ] Powrót z backgroundu nie crashuje gry

### Android (Internal Testing)
- [ ] Gra działa na małym ekranie (360dp)
- [ ] Gra działa na tablecie
- [ ] Reklamy wyświetlają się poprawnie
- [ ] Zakup premium działa (sandbox)
- [ ] GDPR consent pojawia się w UE
- [ ] Gra działa offline
- [ ] Back button zachowuje się poprawnie

---

## 6. Coverage — minimalne progi

```json
// jest.config.js
{
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 80,
      "lines": 80
    },
    "./src/game/mechanics/": {
      "lines": 95
    }
  }
}
```

Mechanika gry — 95% coverage (najważniejsza logika).  
Reszta kodu — 80% minimum.

---

## 7. Pułapki i znane problemy — jest-expo + Expo SDK 56

### jest-expo nie hoist'uje outer variables do jest.mock()

**Problem:** Standardowy babel-jest hoist'uje zmienne `mock*` do fabryk `jest.mock()`. W `jest-expo` to NIE działa — zewnętrzne `const/var mockFn = jest.fn()` będzie `undefined` w momencie uruchomienia fabryki.

❌ Nie rób tak:
```typescript
const mockMethod = jest.fn();

jest.mock('some-native-module', () => ({
  default: () => ({ method: mockMethod }), // mockMethod === undefined tutaj!
}));
```

✅ Rób tak — `jest.fn()` wewnątrz fabryki, dostęp przez `jest.requireMock()`:
```typescript
jest.mock('some-native-module', () => {
  const instance = { method: jest.fn() };
  const fn: any = jest.fn(() => instance);
  return { __esModule: true, default: fn };
});

// W teście:
it('test', () => {
  const instance = jest.requireMock('some-native-module').default();
  instance.method.mockImplementation(() => 'wartość');
  // ...
});
```

### Wersje — wymagane dopasowanie

| Pakiet | Wymagana wersja | Powód |
|---|---|---|
| `jest` | `^29.x` | `jest-expo@56` nie wspiera Jest 30 |
| `@types/jest` | `^29.x` | musi pasować do Jest |
| `@react-native/jest-preset` | dowolna | wymagana przez `jest-expo@56` jako peer dep |
