---
id: troubleshooting
title: Troubleshooting
---

This page covers the most likely failure modes when running or integrating Rug Radar.

## Tool Returns Missing Holder Data

Likely cause:

- `HELIUS_API_KEY` is missing or invalid

What to check:

- your `.env`
- local server logs
- whether `analyze_wallet` is also degraded

## `watch_token` Or `get_token_changes` Fails

Likely cause:

- `DATABASE_URL` is missing
- the migration has not been applied
- Postgres is reachable but rejects connections

What to check:

- run `npm run migrate`
- verify the connection string
- confirm the schema exists

## Repeated Alerts Keep Appearing

Likely cause:

- Redis credentials are missing
- Redis is unavailable
- the dedupe TTL is too short for your use case

What to check:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `ALERT_DEDUPE_TTL_SECONDS`

## Token Lookup By Name Looks Wrong

Likely cause:

- search resolved to a different but more liquid Solana pair

What to do:

- use the token address instead of the name

## MCP Client Cannot See Tools

Likely cause:

- wrong endpoint
- wrong transport setting
- stale client configuration

What to check:

- endpoint should point at `/mcp` when your client expects an MCP endpoint
- use Streamable HTTP where required by the client
- refresh the client's tool discovery state

## Docs Build Fails

Likely cause:

- broken markdown link
- sidebar reference mismatch
- invalid frontmatter or import path

What to check:

- page IDs in `apps/docs/sidebars.ts`
- the file path and frontmatter of any newly added page

## General Debugging Order

1. check `/health`
2. check `/info`
3. check environment variables
4. check database migration state
5. check docs build and server build separately
