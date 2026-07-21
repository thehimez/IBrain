# XandaCross

> Your company already has the answer. XandaCross makes it findable.

XandaCross is a private AI knowledge brain for teams. Upload notes, documents, and internal context; ask a question in plain English; get one synthesized answer with citations instead of a list of files to read.

**Live product:** [xandacross.himeshbhowmik.com](https://xandacross.himeshbhowmik.com)

## The problem

Company knowledge is scattered across documents, meeting notes, inboxes, and people's heads. Search can locate files, but the user still has to open each result, reconcile conflicting information, and work out what is missing.

That gets worse as a team grows: onboarding slows down, decisions are repeated, and useful context disappears when people change projects or leave.

## The product

XandaCross turns a team's private documents into an answerable, connected memory.

1. Sign in with Google.
2. Upload a document or note.
3. XandaCross indexes the content and connects its people, companies, topics, and claims.
4. Ask a question and receive a synthesized answer with traceable sources.
5. Explore the knowledge graph to see how the underlying information connects.

The same brain is available through a responsive web app and an Expo mobile app.

## Why it is different

- **Answers, not search results.** Hybrid retrieval combines semantic and keyword search, then synthesizes the useful context.
- **Citations by default.** Answers link back to their source material so users can verify them.
- **A living knowledge graph.** Documents become connected entities and relationships rather than isolated chunks.
- **Honest gaps.** The answer layer can surface stale, missing, or contradictory context instead of inventing certainty.
- **Private multi-user architecture.** Every request is scoped to the authenticated user's source boundary.
- **Web, mobile, CLI, and MCP.** The same memory layer can serve people and AI agents.

## Example

Instead of returning five meeting notes for:

> What do I need to know before speaking with Acme tomorrow?

XandaCross can produce a concise brief: the latest relationship context, open commitments, recent decisions, and the exact documents supporting each claim.

## Product surfaces

| Surface | What it provides |
|---|---|
| Web app | Chat, document management, citations, and interactive graph exploration |
| Mobile app | Chat, uploads, graph, brain status, and secure OAuth session handling |
| API | Authenticated chat, upload, file, graph, and brain-status endpoints |
| CLI / MCP | Brain operations for developers, automations, and AI agents |

## Architecture

```text
Web (React + Vite) ─┐
                    ├── HTTP API / OAuth ── XandaCross brain engine
Mobile (Expo) ──────┘                         │
                                              ├── hybrid retrieval
                                              ├── synthesis + citations
                                              ├── knowledge graph
                                              └── PGLite or Postgres/pgvector
```

| Layer | Technology |
|---|---|
| Web | React, TypeScript, Vite, Tailwind CSS |
| Mobile | React Native, Expo Router, NativeWind |
| Backend | Bun, TypeScript, Express |
| Retrieval | Vector search, keyword search, reciprocal-rank fusion |
| Storage | PGLite locally or PostgreSQL + pgvector in production |
| Authentication | Google OAuth with database-backed sessions |
| Deployment | Vercel-compatible frontend and independently deployable API |

XandaCross builds its memory engine on [GBrain](https://github.com/garrytan/gbrain), an open-source Postgres-native knowledge and retrieval system. This repository adds the XandaCross product experience: multi-user authentication, web and mobile interfaces, document workflows, and hosted-product integration.

## Run locally

### Prerequisites

- [Bun](https://bun.sh/) 1.3.10 or newer
- An OpenAI API key
- Google OAuth credentials for web login

### 1. Install dependencies

```bash
bun install

cd frontend && bun install && cd ..
cd mobile && bun install && cd ..
```

### 2. Configure the backend

Set the required environment variables in your shell or deployment secret manager:

```bash
export OPENAI_API_KEY="your-openai-key"
export GOOGLE_CLIENT_ID="your-google-client-id"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

For production-scale Postgres, also set `DATABASE_URL`. Without it, the core engine can use local PGLite.

### 3. Start the API

```bash
bun run src/cli.ts serve --http --port 3001 --bind 0.0.0.0
```

### 4. Start the web app

```bash
cd frontend
bun run dev
```

Open [localhost:5000](http://localhost:5000). Vite proxies `/api/*` requests to the backend on port `3001`.

### 5. Start the mobile app

```bash
cd mobile
EXPO_PUBLIC_API_URL="http://YOUR-LAN-IP:5000" bun start
```

Scan the QR code using Expo Go or launch an emulator.

## Useful commands

```bash
bun run typecheck             # Type-check the backend
cd frontend && bun run build  # Build the web client
cd mobile && bun run typescript
bun test                      # Run the backend test suite
```

## Repository layout

```text
frontend/   Web product
mobile/     Expo mobile product
src/        Backend, retrieval engine, API, CLI, and MCP server
admin/      Embedded administration interface
test/       Unit, integration, retrieval, and security tests
docs/       Architecture and operations documentation
skills/     Agent workflows for operating the knowledge brain
```

## Privacy and security

- User data is isolated by source on every read and write path.
- Sessions are stored server-side and delivered through HTTP-only cookies.
- OAuth credentials and model keys belong in environment variables, never source control.
- Answers retain citations so users can inspect the evidence rather than trust a black box.

## Status

XandaCross is an actively developed hackathon product. The current build supports Google login, document ingestion, cited chat, source previews, knowledge-graph exploration, web deployment, and an Android/Expo client.

## License

The repository is available under the [MIT License](LICENSE). Third-party components retain their respective licenses and attribution.
