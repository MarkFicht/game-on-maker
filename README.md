# WordRush 🎯

Fast-paced word guessing party game built as a Progressive Web App (PWA).

## 🎮 Features

- **Multiple Decks**: Movies, Animals, Sports, Food + Premium decks
- **Timer-based gameplay**: 60 seconds to guess as many words as possible
- **Offline support**: PWA works without internet, installable on home screen
- **Premium features**: Remove ads + unlock premium decks (mock implementation)

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📱 PWA Installation

- **iOS**: Share → "Add to Home Screen"
- **Android**: Menu → "Install app"

## 📁 Structure

```
src/
├── game/        # Game engine (UI-independent, portable)
├── services/    # Ads, billing, storage, analytics (mocks)
├── hooks/       # React hooks for game state
├── components/  # UI components
└── pages/       # App screens
```

## 💰 Monetization (Mock)

- **Ads**: `src/services/ads.ts` - feature flag controlled
- **Billing**: `src/services/billing.ts` - localStorage persistence

For production, replace with RevenueCat (mobile) or Stripe (web).

## 🔄 Converting to React Native

1. Copy `src/game/` and `src/services/` (100% portable)
2. Replace localStorage with AsyncStorage
3. Reimplement UI with React Native components

## 📋 Publication Checklist

- [ ] Real Privacy Policy
- [ ] GDPR consent for ads (EU)
- [ ] App Store/Play Store IAP setup
- [ ] ATT prompt (iOS 14.5+)
