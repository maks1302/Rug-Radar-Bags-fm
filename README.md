# Rug Radar

Instant token and wallet due diligence for Solana, inside Claude.

Rug Radar is a production-ready MCP server that turns fragmented onchain data into clear, structured risk intelligence. It helps retail traders quickly answer: _is this token risky, is this wallet credible, and what changed since last check?_

## Live Deployment

- Landing + docs: **https://rugrdr.xyz**
- MCP endpoint (primary): **https://mcp.rugrdr.xyz**
- Health check: **https://mcp.rugrdr.xyz/health**
- API info: **https://mcp.rugrdr.xyz/info**

## What Rug Radar Does

- Aggregates data from:
  - DEX Screener (market/liquidity/volume)
  - RugCheck (contract safety/honeypot)
  - Helius (holders/wallet activity)
  - Bags (ecosystem/claim activity context)
- Computes deterministic risk scoring (0-100)
- Returns partial results gracefully when some sources fail
- Supports watchlists + change tracking via Postgres
- Deduplicates noisy alerts with Upstash Redis

## MCP Tools

### 1) `analyze_token`
Full token risk report by address or name.

### 2) `scan_risk`
Fast red-flag mode (minimal, high-signal output).

### 3) `analyze_wallet`
Wallet behavior classification (`Sniper`, `Whale`, `Bot`, `Insider`, `Retail`) with activity heuristics.

### 4) `compare_tokens`
Side-by-side health comparison and recommendation.

### 5) `watch_token`
Create/update watch thresholds and store baseline snapshot.

### 6) `get_token_changes`
Compare latest snapshot to previous one and return deltas + triggered alerts.

## Example Prompts (Claude/Gemini/MCP clients)

- `Analyze BONK`
- `Scan red flags for So11111111111111111111111111111111111111112`
- `Analyze this wallet: <wallet_address>`
- `Compare BONK vs WIF`
- `Watch <token> with 20% liquidity-drop threshold`
- `What changed since last check for <token>?`

## Risk Score Model

Higher score = more risk.

- Holder concentration (35%)
- Liquidity depth (25%)
- Contract safety (25%)
- Token age (10%)
- Volume consistency (5%)

Labels:
- 0-25: Low Risk
- 26-50: Medium Risk
- 51-75: High Risk
- 76-100: Extreme Risk

## Architecture

- `src/index.ts`: MCP server + HTTP endpoints
- `src/tools/*`: Tool handlers
- `src/api/*`: External data adapters
- `src/utils/*`: Risk/format/validation/http utilities
- `src/db/*`: Raw Postgres + Redis integration
- `migrations/*`: SQL schema migrations
- `apps/docs`: Docusaurus landing + docs site

## Repo Structure

```text
.
├── apps/
│   └── docs/                # Landing page + user docs (Docusaurus)
├── migrations/              # SQL migrations
├── scripts/                 # Migration runner
├── skill/                   # Claude skill prompt
├── src/
│   ├── api/                 # DEX Screener, RugCheck, Helius, Bags
│   ├── db/                  # pg + upstash redis repositories
│   ├── tools/               # MCP tools
│   ├── utils/               # scoring, validators, HTTP/cache
│   └── index.ts             # MCP server entry
├── .env.example
├── package.json
└── README.md
```

## Local Development

### 1) Install dependencies

```bash
npm install
npm install --prefix apps/docs
```

### 2) Configure environment

```bash
cp .env.example .env
```

Required for full functionality:
- `HELIUS_API_KEY`
- `DATABASE_URL`

Recommended:
- `BAGS_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### 3) Run migrations

```bash
npm run migrate
```

### 4) Start API

```bash
npm run dev
```

### 5) Start docs/landing

```bash
npm run dev --prefix apps/docs
```

## Build Commands

```bash
npm run build
npm run build --prefix apps/docs
```

## Deployment Split

### Vercel (landing + docs)
- Project root: `apps/docs`
- Build: `npm run build`
- Output: `build`
- Domain: `rugrdr.xyz`

### Coolify (MCP API)
- Project root: repository root
- Build: `npm run build`
- Start: `npm run start`
- Port: `3000`
- Domain: `mcp.rugrdr.xyz`

## Environment Variables

See `.env.example`.

Core variables:

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

## Reliability & Error Handling

- All external API calls use timeout + try/catch
- Partial-data responses returned when a source is unavailable
- Source-level status notes included in outputs
- In-memory API caching to reduce repetitive upstream calls

## Security Notes

Current deployment can run without auth for rapid testing.
For public usage, add API key middleware on MCP endpoint and per-user identity mapping.

## Documentation

User-facing docs live at:
- https://rugrdr.xyz/docs

## Disclaimer

Rug Radar provides analysis, not financial advice. Always DYOR.
