---
name: GBrain multi-user migration
description: How multi-user isolation was added — auth headers, source isolation, migration 123
---

# GBrain Multi-User Migration

## The isolation pattern
GBrain already had source_id on every data table. Each Replit user gets a `sources` row with `id = 'user:{replit_user_id}'`. No owner_id columns needed — reuses existing architecture.

**Why:** Adding owner_id to 20+ tables would be a major schema migration. source_id already carries the same semantic.

## Auth mechanism
- Backend reads `X-Replit-User-Id`, `X-Replit-User-Name`, `X-Replit-User-Image` headers (injected by Replit proxy)
- `/api/auth/me` upserts user + source on first visit; 401 if no headers
- Frontend: calls `/api/auth/me` on load; 401 → LoginScreen; 200 → app loads
- Login popup: `window.open('https://replit.com/auth_with_repl_site?domain=...', '_blank', ...)`
- After popup: `window.addEventListener('message', e => { if (e.data === 'authed') fetchMe() })`

## dispatchToolCall source scoping
Pass `{ sourceId: user.sourceId }` as the 4th arg to scope think/search to a user's data.

## Conversations are in localStorage
Keyed by `gbrain_conversations_{userId}`. No DB conversation table exists — this is by design.
