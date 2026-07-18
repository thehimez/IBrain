---
name: GBrain file preservation & source preview
description: How uploaded documents are preserved in the files table and surfaced in the chat UI as Source chips with a preview modal.
---

# GBrain file preservation & source preview

## What was built
- Migration 124: `files.content_raw TEXT` — stores original text content inline for text/* and application/json uploads
- storage_path convention for inline uploads: `inline:<content_hash>`
- `/api/upload` now calls `engine.upsertFile` before queueing the ingest_capture job; returns `file_id` in the response body and passes it via `job.data.file_id`
- `ingest_capture` handler: after `importFromContent`, reads `data.file_id` and calls `engine.updateFilePageLink(fileId, page.id, slug)` (best-effort, non-fatal)

## New engine methods (postgres + pglite)
- `getFileById(id, sourceId)` — scoped by source_id for security
- `getFileByPageSlug(slug, sourceId)` — maps citation slug → file row
- `updateFilePageLink(id, pageId, pageSlug)` — sets page_id + page_slug after ingestion

## New REST endpoints (serve-http.ts)
- `GET /api/files/by-slug?slug=<slug>` — citation → file metadata (no content_raw)
- `GET /api/files/:id` — file metadata + content (for text types)
- `GET /api/files/:id/download` — stream file as attachment
- All require Replit auth; scoped to user's source_id (404 if wrong user)

**Why:** `num()` helper wraps BigInt DB values — postgres.js returns BIGINT/SERIAL as BigInt, which `JSON.stringify` rejects.

## Frontend components
- `SourceChips.tsx` — replaces raw citation slugs; fetches by-slug in parallel, renders clickable chips
- `DocumentModal.tsx` — preview modal with metadata, per-MIME rendering, download button
- `ChatBubble.tsx` — citations section replaced with `<SourceChips citations={message.citations} />`

## Security
- All file endpoints 401 for unauthenticated requests
- Wrong-user access returns 404 (not 403) to avoid leaking existence
- `by-slug` also scoped by source_id — users cannot resolve other users' slugs

## Known quirk
- `sources.name` has a unique constraint — test users must have unique display names, not just unique IDs
