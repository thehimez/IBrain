# GBrain on Replit — Multi-User

**GBrain** is Garry Tan's personal knowledge brain — a Postgres-native RAG/synthesis engine with hybrid search, knowledge graph, citations, and gap analysis.

## Architecture

| Layer | Stack |
|---|---|
| Frontend | React + Vite + Tailwind, port 5000 |
| API server | Bun + Express HTTP MCP server, port 3001 |
| DB | Replit PostgreSQL (pgvector enabled) |
| AI | OpenAI gpt-4o (chat/think), gpt-4o-mini (expansion), text-embedding-3-small (embeddings) |
| Jobs | GBrain minion worker (background ingestion queue) |
| Auth | Replit auth (X-Replit-User-Id headers injected by Replit proxy) |

## Multi-User Architecture

Each user is completely isolated:
- **`users` table** (migration 123) stores Replit user identity
- **Per-user `sources` row** (`user:{replit_user_id}`) is the data isolation boundary — all pages, chunks, embeddings, and knowledge graph edges are source-scoped by the existing GBrain architecture
- **`/api/auth/me`** resolves the Replit user from headers, upserts user + source on first visit
- **`/api/upload`** requires auth and tags documents with the user's sourceId
- **`/api/chat`** scopes `think` calls to the user's sourceId (via `DispatchOpts.sourceId`)
- **Frontend conversations** stored in localStorage keyed by userId (`gbrain_conversations_{userId}`)

### User data flow
1. User opens app → frontend calls `/api/auth/me`
2. No auth headers → login screen shown (Replit auth popup)
3. After auth → Replit proxy injects `X-Replit-User-Id`, `X-Replit-User-Name`, `X-Replit-User-Image` on every request
4. `/api/auth/me` upserts user row + creates `sources` entry → returns user info
5. All subsequent API calls are automatically scoped to that user's sourceId

## Workflows

- **Start application** — `cd frontend && bun run dev` (React UI, port 5000)
- **GBrain API** — `bun run src/cli.ts serve --http --port 3001 --bind 0.0.0.0 --print-admin-token`
- **GBrain Worker** — `bun run src/cli.ts jobs work --concurrency 2` (processes ingestion + embed jobs)

All three must be running for the full system to work.

## Environment Variables

Set as Replit Secrets / env vars:

| Key | Value | Notes |
|---|---|---|
| `OPENAI_API_KEY` | your key | Required — chat, synthesis, embeddings |
| `GBRAIN_CHAT_MODEL` | `openai:gpt-4o` | Overrides file-plane default |
| `GBRAIN_EXPANSION_MODEL` | `openai:gpt-4o-mini` | Query expansion model |
| `GBRAIN_EMBEDDING_MODEL` | `openai:text-embedding-3-small` | Embedding model |
| `GBRAIN_EMBEDDING_DIMENSIONS` | `1536` | Must match embedding model |

**DB-plane model config also required** (set once at init, persists in DB):
```
bun run src/cli.ts config set models.think openai:gpt-4o
bun run src/cli.ts config set models.chat openai:gpt-4o
bun run src/cli.ts config set models.expansion openai:gpt-4o-mini
bun run src/cli.ts config set models.tier.deep openai:gpt-4o
bun run src/cli.ts config set models.tier.reasoning openai:gpt-4o
bun run src/cli.ts config set models.tier.utility openai:gpt-4o-mini
```

## Upload API (custom endpoint)

`POST /api/upload` — no auth required, accepts:
```json
{ "filename": "doc.md", "content": "...", "mimeType": "text/markdown" }
```
Supported mimeTypes: `text/plain`, `text/markdown`, `text/html`, `application/json`

## Admin Dashboard

The GBrain API prints an admin token in its workflow logs on each start.
Use it to log into `/admin` at port 3001.

## Key Quirks

- GBrain defaults to Anthropic models at the gateway level. With only an OpenAI key, the DB-plane model config keys must be set (see above) AND the API must be restarted so `reconfigureGatewayWithEngine` registers `gpt-4o` as an extended model.
- The OpenAI recipe's built-in chat model allowlist is `['gpt-5.2', 'gpt-4o-mini']`. Using `gpt-4o` works via the extended-model registration that happens at API startup, but requires the DB config to be set before the first restart.
- `ingest_capture` jobs need the GBrain Worker workflow running. Without it, uploaded documents sit in the queue forever.
- `pageCount` in `/api/brain/status` reflects embedded pages, not all ingested pages.
