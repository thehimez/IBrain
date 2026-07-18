---
name: GBrain upload endpoint
description: Custom browser upload endpoint added to serve-http.ts and the frontend UploadModal
---

## What was added

### Backend: `POST /api/upload` (src/commands/serve-http.ts)
- No OAuth required (like `/api/chat` and `/api/brain/status`)
- Accepts JSON: `{ filename: string, content: string, mimeType: string }`
- Supported mimeTypes: `text/plain`, `text/markdown`, `text/html`, `application/json`
- Binary (PDF, images) rejected — backend ingest pipeline doesn't support them yet
- Queues an `ingest_capture` minion job with `source_id: 'browser-upload'`
- Inserted right before the `POST /webhooks/github` comment block

### Frontend additions
- `frontend/src/services/upload.ts` — upload service + file type helpers
- `frontend/src/components/UploadModal.tsx` — drag-and-drop modal with per-file status
- `frontend/src/components/MessageInput.tsx` — added Paperclip button (`onUpload` prop)
- `frontend/src/components/ChatWindow.tsx` — wires upload modal, tracks `uploadedCount`

## GBrain Worker workflow required
`ingest_capture` jobs sit in the queue until a worker processes them. The `serve --http` command does NOT embed a worker. A separate `GBrain Worker` workflow must be running:
```
bun run src/cli.ts jobs work --concurrency 2
```

**Why:** The ingest queue submits jobs to PostgreSQL. Without a worker polling the queue, uploaded documents are never processed and pages are never created.
