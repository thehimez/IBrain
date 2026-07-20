---
name: GBrain mobile app
description: React Native Expo mobile app scaffold for GBrain — auth, chat, documents, knowledge graph
---

## Stack
- Expo SDK 52, Expo Router v4, NativeWind v4 (Tailwind CSS)
- TanStack React Query v5, expo-secure-store, AsyncStorage
- react-native-svg for knowledge graph (force simulation)
- expo-document-picker + expo-file-system for uploads

## Location
`mobile/` directory. Package entry is `expo-router/entry`.

## Auth
- Uses `expo-web-browser.openAuthSessionAsync` for Google and Replit OAuth
- On iOS: ASWebAuthenticationSession shares cookies with URLSession → fetch() gets session cookie automatically
- On Android: Chrome Custom Tabs do NOT share cookies; production Android builds need `react-native-webview` + `@react-native-cookies/cookies`

**Why:** Backend uses cookie-based sessions with no mobile token exchange endpoint. Cannot modify backend.

## API URL
- Points at port 5000 (Vite dev server) which proxies /api/* to port 3001
- Configured in `constants/api.ts` (EXPO_PUBLIC_API_URL env var)

## TypeScript
- Clean compile as of initial build (tsc --noEmit passes with 0 errors)
- Fixed: graph.tsx refetch passed directly to onPress — wrapped in arrow function

## Key patterns
- Conversations stored in AsyncStorage keyed by userId via `utils/storage.ts`
- Auth user stored in SecureStore; validated against /api/auth/me on app launch
- All API calls include Cookie header from SecureStore (fallback to credentials: include)
