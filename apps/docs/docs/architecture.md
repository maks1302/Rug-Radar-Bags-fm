---
id: architecture
title: Architecture
---

This page explains how the project is structured at the code level.

## High-Level Architecture

Rug Radar has two major parts:

- the MCP/HTTP server
- the Docusaurus docs app

The server is in the repository root. The docs app lives in `apps/docs/`.

## Server Composition

### Entry point

`src/index.ts`

Responsibilities:

- load environment variables
- create the MCP server
- register tools
- expose Express routes
- manage MCP transport sessions

### Tool handlers

Located in `src/tools/`.

Each tool owns:

- input handling
- orchestration of upstream adapters
- result shaping
- graceful fallback behavior where relevant

### External API adapters

Located in `src/api/`.

Responsibilities:

- call DEX Screener, RugCheck, Helius, and Bags
- normalize upstream response shapes
- return clean internal snapshots

### Utilities

Located in `src/utils/`.

Responsibilities:

- scoring
- formatting
- validation
- HTTP fetch/cache/error normalization

### Persistence layer

Located in `src/db/`.

Responsibilities:

- Postgres connectivity and queries
- watchlist, snapshot, alert, and event persistence
- Redis alert deduplication

## Request Flow Examples

### `analyze_token`

1. validate input
2. resolve by address or token name
3. fetch DEX data
4. fetch RugCheck, Helius, and Bags data
5. compute risk score
6. return structured result plus source metadata

### `watch_token`

1. validate token address
2. normalize thresholds
3. upsert watchlist in Postgres
4. run token analysis
5. store baseline snapshot and tool event

### `get_token_changes`

1. load latest snapshot
2. run fresh token analysis
3. store new snapshot
4. compute change set
5. evaluate watchlist thresholds
6. insert deduplicated alerts

## Public HTTP Endpoints

- `/`: info-style metadata response
- `/health`: health status
- `/info`: name, version, tools, and endpoint map
- `/mcp`: MCP transport

## Caching And State

- upstream HTTP responses are cached in memory
- Postgres stores durable watchlists and snapshots
- Redis is optional and stores dedupe keys for alerts

## Docs App

The documentation and landing site are built with Docusaurus and live under `apps/docs/`.
