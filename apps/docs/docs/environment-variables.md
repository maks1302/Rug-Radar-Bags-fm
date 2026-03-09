---
id: environment-variables
title: Environment Variables
---

Rug Radar can run in a degraded mode, but some tools and features depend on specific environment variables.

## Core Variables

### `HELIUS_API_KEY`

Required for:

- token holder analysis
- wallet analysis

Without it:

- `analyze_wallet` falls back to incomplete output
- token analysis loses holder concentration coverage

### `DATABASE_URL`

Required for:

- `watch_token`
- `get_token_changes`
- all snapshot, watchlist, alert, and tool-event persistence

### `PORT`

Optional. Defaults to `3000`.

### `NODE_ENV`

Optional. Useful for deployment/runtime conventions.

## Optional Variables

### `BAGS_API_KEY`

Enables Bags ecosystem context in `analyze_token`.

Without it:

- token analysis still works
- Bags is marked unavailable

### `UPSTASH_REDIS_REST_URL`
### `UPSTASH_REDIS_REST_TOKEN`

Enable Redis-backed alert deduplication.

Without them:

- alerts can still be inserted
- deduplication falls back to permissive behavior

### `REDIS_CACHE_TTL_SECONDS`

Used by the in-memory HTTP cache helper for default cache durations.

### `ALERT_DEDUPE_TTL_SECONDS`

Controls Redis alert dedupe TTL. The code defaults to `600` seconds if not provided.

## Example

```env
HELIUS_API_KEY=
BAGS_API_KEY=
DATABASE_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
REDIS_CACHE_TTL_SECONDS=30
ALERT_DEDUPE_TTL_SECONDS=600
PORT=3000
NODE_ENV=development
```

## Recommended Configurations

### Minimal local token analysis

- `HELIUS_API_KEY`

### Full local feature set

- `HELIUS_API_KEY`
- `DATABASE_URL`
- `BAGS_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### Docs-only work

No runtime env vars are required if you are only editing the Docusaurus site.
