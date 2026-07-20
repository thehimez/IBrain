---
name: GBrain OpenAI model setup
description: How to configure GBrain to use OpenAI instead of Anthropic (the default)
---

## The problem
GBrain's gateway defaults to `anthropic:claude-sonnet-4-6` (chat) and `anthropic:claude-haiku-*` (expansion). The `think` op uses `tier: 'deep'` fallback `'opus'`, which resolves via the built-in alias to `anthropic:claude-opus-4-7`. With only `OPENAI_API_KEY`, every chat/synthesis call returns "no LLM available".

## Two-layer fix required

### 1. Env vars (file-plane, read at startup by loadConfig → configureGateway)
Set these as Replit env vars (already done):
- `GBRAIN_CHAT_MODEL=openai:gpt-4o`
- `GBRAIN_EXPANSION_MODEL=openai:gpt-4o-mini`
- `GBRAIN_EMBEDDING_MODEL=openai:text-embedding-3-small`
- `GBRAIN_EMBEDDING_DIMENSIONS=1536`

### 2. DB-plane model config (persists across restarts, read by resolveModel at think-time)
Must be run once with the CLI:
```
bun run src/cli.ts config set models.think openai:gpt-4o
bun run src/cli.ts config set models.chat openai:gpt-4o
bun run src/cli.ts config set models.expansion openai:gpt-4o-mini
bun run src/cli.ts config set models.tier.deep openai:gpt-4o
bun run src/cli.ts config set models.tier.reasoning openai:gpt-4o
bun run src/cli.ts config set models.tier.utility openai:gpt-4o-mini
```

### 3. API restart required after setting DB config
`reconfigureGatewayWithEngine` runs at startup and registers configured models as "extended models". The OpenAI recipe's built-in chat allowlist is `['gpt-5.2', 'gpt-4o-mini']` — `gpt-4o` is NOT in it. Without the extended-model registration (which only happens at startup when `_config.chat_model = 'openai:gpt-4o'`), `assertTouchpoint` rejects `gpt-4o` and `tryBuildGatewayClient` returns null → "no LLM available".

**Why:** `probeChatModel` only hard-blocks Anthropic models without an Anthropic key. OpenAI passes the probe but fails later at `assertTouchpoint` unless registered as extended. Extended registration happens in `reconfigureGatewayWithEngine` which reads the DB config at startup.

**How to apply:** Any time OpenAI is the only provider, both env vars AND DB config must be set, then restart the API.
