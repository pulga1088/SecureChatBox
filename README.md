# SecureChat Frontend (Expo React Native)

Mobile frontend for an end-to-end encrypted chat style app inspired by WhatsApp/iPhone UI.

## Implemented Screens

- Animated Landing Page
- OTP Login (phone + OTP flow UI)
- Chat List Screen
- Chat Room Screen
- Profile Screen

## Tech Stack

- Expo (React Native + Metro)
- TypeScript
- React Navigation (native stack)
- Expo Linear Gradient
- React Native Animated API

## Run on Android Emulator

1. Start Android emulator from Android Studio Device Manager.
2. In this workspace run:

```bash
npm install
npm run android
```

This starts Metro and opens the app on your running emulator.

## Useful Scripts

- `npm run start` : Start Expo/Metro
- `npm run android` : Open on Android emulator/device
- `npm run ios` : Open on iOS simulator
- `npm run web` : Open web preview
- `npm run dev` : Start Metro with cache clear

## Notes

- Current OTP flow is frontend-only mock UI.
- Chat data is local mock state for UI demonstration.
- End-to-end encryption backend/service integration can be connected next.
