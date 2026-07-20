<<<<<<< HEAD
# XandaCross Mobile

React Native + Expo app for XandaCross — feature-equivalent to the web frontend.
=======
# GBrain Mobile

React Native + Expo app for GBrain — feature-equivalent to the web frontend.
>>>>>>> origin/main

## Stack

| Layer | Library |
|---|---|
| Framework | Expo SDK 52 + Expo Router v4 |
| Styling | NativeWind v4 (Tailwind CSS) |
| Data fetching | TanStack React Query v5 |
| Auth | `expo-web-browser` (system OAuth) |
| Secure storage | `expo-secure-store` |
| Local history | `@react-native-async-storage/async-storage` |
| Knowledge graph | `react-native-svg` + custom force simulation |
| File picker | `expo-document-picker` + `expo-file-system` |

## Setup

1. **Set the API URL** — edit `constants/api.ts` or create `.env`:
   ```
   EXPO_PUBLIC_API_URL=https://YOUR_REPLIT_DEV_DOMAIN
   ```
   The mobile app points at the Vite dev server (port 5000) which proxies `/api/*`
<<<<<<< HEAD
   to the XandaCross API on port 3001.
=======
   to the GBrain API on port 3001.
>>>>>>> origin/main

2. **Install and start:**
   ```bash
   cd mobile
   bun install
   bun start        # or: bunx expo start
   ```

3. **Scan QR** with Expo Go on your device, or press `w` for the web preview.

## Auth Notes

- **iOS** — Google OAuth via `openAuthSessionAsync` uses `ASWebAuthenticationSession`,
  which shares cookies with `URLSession`. This means session cookies set by the
<<<<<<< HEAD
  XandaCross backend flow automatically into `fetch()` calls. Works out of the box.
=======
  GBrain backend flow automatically into `fetch()` calls. Works out of the box.
>>>>>>> origin/main
- **Android** — Chrome Custom Tabs do NOT share cookies with the native network
  stack. For a production Android build, create a development build with
  `react-native-webview` and `@react-native-cookies/cookies` and swap the auth
  implementation in `services/auth.ts`.

## Screens

| Tab | Features |
|---|---|
| Chat 💬 | Conversation history, citations, source chips, gap warnings, markdown |
| Documents 📄 | File list, drag/pick to upload (.txt .md .html .json), preview |
| Graph 🕸️ | Force-directed SVG graph, pan, node tap → detail sheet |
| Profile 👤 | User info, brain stats, sign out |

## File Structure

```
mobile/
├── app/
│   ├── _layout.tsx          Root layout (AuthProvider + QueryClient)
│   ├── index.tsx            Auth redirect guard
│   ├── (auth)/index.tsx     Login screen (Google + Replit)
│   └── (tabs)/
│       ├── _layout.tsx      Bottom tab navigator
│       ├── index.tsx        Chat screen
│       ├── documents.tsx    Documents screen
│       ├── graph.tsx        Knowledge graph screen
│       └── profile.tsx      Profile screen
├── components/
│   ├── chat/                ChatBubble, MessageInput, SourceChips, etc.
│   ├── documents/           DocumentCard, UploadProgress
│   ├── graph/               GraphCanvas (SVG + force simulation)
│   └── common/              LoadingSpinner, EmptyState, ErrorView
├── hooks/                   useAuth, useChat, useDocuments, useGraph
├── services/                api, auth, chat, documents, graph
├── types/index.ts           Shared TypeScript types
├── constants/               api.ts, colors.ts
└── utils/                   storage.ts, format.ts
```
