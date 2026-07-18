# GBrain

**Postgres-native personal knowledge brain with hybrid RAG search**, built by Garry Tan (YC CEO).

## How to Run

The app starts automatically via the "Start application" workflow, which runs:

```
bun run src/cli.ts serve --http --port 5000
```

This launches the HTTP MCP server with the admin dashboard at `/admin`.

## Stack

- **Runtime**: Bun (TypeScript)
- **Database**: PGLite (embedded, no external server needed)
- **Embeddings/Chat**: OpenAI (`text-embedding-3-large`, `gpt-5.2`)

## Key Commands (run in Shell)

```bash
# Health check
bun run src/cli.ts doctor

# Import a folder of markdown files
bun run src/cli.ts import <path>

# Search the brain
bun run src/cli.ts search "your query"

# Run a quick test
bun run test
```

## Environment

- `OPENAI_API_KEY` — required; set as a Replit Secret

## User preferences
