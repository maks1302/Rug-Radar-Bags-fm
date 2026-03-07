# Rug Radar

Rug Radar is a production-ready MCP server that gives instant Solana token and wallet due diligence inside Claude. It aggregates live onchain and market signals, then returns structured risk reports that are easy for retail traders to understand and share.

## Features

- 6 MCP tools: `analyze_token`, `analyze_wallet`, `scan_risk`, `compare_tokens`, `watch_token`, `get_token_changes`
- Multi-source analysis: DEX Screener, RugCheck, Helius, Bags
- Deterministic 0-100 risk scoring engine
- Partial-data fault tolerance (never empty response)
- 8-second timeout on all external API requests
- Simple in-memory caching to reduce duplicate API calls
- Postgres-backed watchlists, snapshots, alerts, and usage events
- Upstash Redis alert dedupe layer
- HTTP health endpoint for Railway/Render

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Add keys:
- `HELIUS_API_KEY` from https://helius.dev
- `BAGS_API_KEY` (optional but recommended)
- `DATABASE_URL` (Neon Postgres)
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (recommended for alert dedupe)

4. Run database migrations:

```bash
npm run migrate
```

5. Run in development:

```bash
npm run dev
```

6. Build and run production:

```bash
npm run build
npm run start
```

## Docusaurus Docs App

Comprehensive documentation is scaffolded in `apps/docs` with docs route configured at `/docs`.
When deployed as the public site, docs app root (`/`) acts as the landing page and docs are available under `/docs`.

Run locally:

```bash
npm install --prefix apps/docs
npm run dev --prefix apps/docs
```

Build:

```bash
npm run build --prefix apps/docs
```

## API Keys

- Helius: required for holder + wallet behavior analysis.
- Bags: optional but supported via live API calls when `BAGS_API_KEY` is set. If unavailable, the server falls back gracefully with partial-data notes.
- Postgres (`DATABASE_URL`): required for `watch_token` and `get_token_changes`.
- Upstash Redis: optional but recommended to prevent duplicate alerts during volatility.

## HTTP Endpoints

- `GET /` API info JSON
- `GET /info` basic service info + available tools
- `GET /health` returns:

```json
{ "status": "ok", "version": "1.0.0" }
```

- `POST /mcp` MCP endpoint for Claude-compatible clients

## Claude Skill Registration

1. Deploy this service to Railway or Render.
2. Copy deployed base URL (e.g., `https://your-rug-radar.up.railway.app`).
3. In Claude skill setup, configure MCP server URL to `https://.../mcp`.
4. Add the system prompt from `skill/system-prompt.md`.
5. Verify tool calls by prompting examples below.

## Available Tools + Example Prompts

### 1) `analyze_token`
Input: `token_address` or `token_name`

Example prompts:
- `Analyze this token: So11111111111111111111111111111111111111112`
- `Research BONK`

### 2) `analyze_wallet`
Input: `wallet_address`

Example prompts:
- `Analyze this wallet: 7Yz...abc`
- `Is this wallet a whale or a bot? 7Yz...abc`

### 3) `scan_risk`
Input: `token_address`

Example prompts:
- `Scan red flags for this token: So11111111111111111111111111111111111111112`
- `Is this token safe? So11111111111111111111111111111111111111112`

### 4) `compare_tokens`
Input: `token_a`, `token_b`

Example prompts:
- `Compare BONK vs WIF`
- `Which is healthier: tokenA vs tokenB?`

### 5) `watch_token`
Input: `token_address` (+ optional user and thresholds)

Example prompts:
- `Watch this token and alert me if risk jumps: So11111111111111111111111111111111111111112`
- `Track BONK with 15% liquidity-drop threshold`

### 6) `get_token_changes`
Input: `token_address` (+ optional `user_id`)

Example prompts:
- `What changed since last check for So11111111111111111111111111111111111111112?`
- `Run delta check and trigger alerts for BONK`

## Risk Score Model (0-100)

Higher score means more risk.

- Holder concentration (35%)
  - >80% top10 = +35
  - >60% = +25
  - >40% = +15
- Liquidity depth (25%)
  - <$10k = +25
  - <$50k = +18
  - <$200k = +10
- Contract safety (25%)
  - honeypot = +25
  - mint authority active = +10
  - freeze authority active = +8
  - unverified = +5
- Token age (10%)
  - <24h = +10
  - <7d = +7
  - <30d = +3
- Volume consistency (5%)
  - spike/no follow through = +5

Risk labels:
- 0-25: Low Risk
- 26-50: Medium Risk
- 51-75: High Risk
- 76-100: Extreme Risk

## Implementation Notes

- Added confidence score to risk output based on data-source availability.
- Added optional bags signal adjustment (small bounded impact) for better context.
- Added in-memory cache to reduce repeated upstream calls and improve latency.
- Added wallet clustering/dev concentration heuristics to improve red-flag detection.
- Bags API integration now pulls creator, lifetime fee-share, claim stats/events, and pool presence signals.
- Added raw SQL migration flow (`npm run migrate`) for zero-ORM persistence.
- Added Postgres storage for watchlists, token snapshots, alerts, and tool usage events.
- Added Redis-based alert dedupe to suppress spammy repeated triggers.

## Disclaimer

Rug Radar is an analysis tool, not a financial advisor. Always DYOR.
