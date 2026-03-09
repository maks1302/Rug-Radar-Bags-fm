---
id: database-schema
title: Database Schema
---

Rug Radar uses Postgres for watchlists, snapshots, alerts, and tool-event logging.

The schema is defined in `migrations/001_init.sql`.

## Tables

### `watchlists`

Stores one active rule set per `user_id` and `token_address`.

Key fields:

- `user_id`
- `token_address`
- `rules_json`
- `active`
- timestamps

Important behavior:

- `watch_token` upserts on `(user_id, token_address)`

### `token_snapshots`

Stores token analysis snapshots over time.

Key fields:

- `token_address`
- `snapshot_json`
- `risk_score`
- `liquidity`
- `top10_pct`
- `fetched_at`

Important behavior:

- `get_token_changes` loads the latest snapshot and then inserts a new one

### `alerts`

Stores triggered alert records tied to a watchlist.

Key fields:

- `watchlist_id`
- `token_address`
- `trigger_type`
- `trigger_detail`
- `dedupe_key`
- `sent_at`

Important behavior:

- `dedupe_key` is unique
- Redis is used to reduce duplicate alert insertion attempts within the current dedupe window

### `tool_events`

Stores tool usage events for observability and future analytics.

Key fields:

- `tool_name`
- `user_id`
- `token_address`
- `meta_json`
- `created_at`

## What Is Not Stored

- continuous market ticks
- full wallet histories outside current tool calls
- user auth records
- push-delivery state for alerts

## Operational Implications

- if Postgres is unavailable, watch and change-tracking features will fail
- token and wallet analysis without persistence can still work
