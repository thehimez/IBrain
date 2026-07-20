---
name: GBrain auth layer
description: DB-backed cookie sessions + Google OAuth 2.0; no third-party auth libraries; Replit headers kept as fallback
---

## Architecture

New files under `src/core/auth/`:
- `types.ts` — `AuthenticatedUser` interface (id, provider, providerUserId, name, email, avatar, sourceId)
- `session.ts` — `createSession`, `validateSession`, `extendSession`, `deleteSession`; cookie name `gbrain_session`
- `google-provider.ts` — `buildGoogleAuthUrl`, `exchangeGoogleCode`, `fetchGoogleUserInfo`; state cookie `gbrain_oauth_state`
- `auth-service.ts` — `AuthService.getCurrentUser(req, engine)` tries cookie → Replit headers; `upsertProviderUser` uses ON CONFLICT (id)

## Key decisions

**No third-party auth library** — user explicitly rejected Better Auth, Auth.js, Passport.js.

**source_id formula:**
- Replit: `user:<replit_user_id>` (unchanged — no existing data breaks)
- Google: `user:google:<google_sub>`

**user.id formula:**
- Replit: `<replit_user_id>` (numeric string, unchanged)
- Google: `google:<sub>` — never collides with Replit IDs

**ON CONFLICT key:** Uses `ON CONFLICT (id)` (PK) in `upsertProviderUser`. No dependency on the partial unique index on (provider, provider_user_id).

**Replit fallback:** Active unless `GBRAIN_REPLIT_AUTH=disabled`. Phase 1 always enables it.

**Why:** Rolling 7-day HttpOnly cookie sessions. CSRF protected via state nonce cookie. Google redirect URI auto-detected from request headers so it works in Replit without extra env config.

## Migration v125 (multi_provider_auth)

Adds to `users` table: `provider TEXT`, `provider_user_id TEXT`, `email TEXT`.
Back-fills existing rows: `provider='replit', provider_user_id=replit_user_id WHERE provider IS NULL`.
Creates partial unique index on `(provider, provider_user_id) WHERE NOT NULL`.
Creates `sessions` table with `id, user_id, provider, created_at, expires_at, ip, user_agent`.

## serve-http.ts changes

Single `authService` singleton used everywhere. `requireAuth` helper replaces old `requireReplitAuth`.
New routes: `GET /api/auth/google`, `GET /api/auth/google/callback`, `POST /api/auth/logout`.
`/api/auth/me` now returns `provider` and `email` fields.

## Frontend

`AuthContext.tsx`: `loginWithGoogle()` → full page redirect to `/api/auth/google`; `loginWithReplit()` → existing popup flow.
`LoginScreen.tsx`: "Continue with Google" as primary white button; "Sign in with Replit" as secondary dark button.
`App.tsx`: destructures `loginWithGoogle, loginWithReplit` (not the old `login`).

## Secrets required for Google login

`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — set in Replit Secrets.
`GOOGLE_REDIRECT_URI` — optional; auto-detected from request if unset.
`SESSION_SECRET` — already set.
