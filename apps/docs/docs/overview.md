---
id: overview
title: What Rug Radar Does
---

Rug Radar is a Solana-focused MCP server for fast token and wallet due diligence. Most users should use the already deployed remote MCP endpoint at `https://mcp.rugrdr.xyz/mcp` inside Claude or any MCP-compatible client. Self-hosting is supported, but it is the advanced path, not the default path.

It is designed to answer a narrow but high-value set of questions quickly:
- Is this token risky?
- Which specific failure modes are visible right now?
- Does this wallet look like a sniper, bot, whale, insider, or normal retail flow?
- Which of two tokens looks healthier on a risk-adjusted basis?
- What changed since the last snapshot?

## Who It Is For

- Retail traders who need a first-pass risk read before entering or sizing a trade
- Researchers who want structured snapshots instead of manually stitching together APIs
- Communities and moderators who need short, repeatable token reviews
- Agent builders who want a remote MCP endpoint with deterministic tool outputs

## Default Way To Use Rug Radar

For most users, the workflow is:

1. connect your MCP client to `https://mcp.rugrdr.xyz/mcp`
2. let the client discover the Rug Radar tools
3. use plain-language prompts like `Analyze BONK` or `Compare BONK vs WIF`

You do not need to clone the repository or run the server locally just to use Rug Radar.

## What The Project Includes

- A TypeScript MCP server in `src/`
- Six MCP tools for token analysis, wallet analysis, comparison, and monitoring
- A Docusaurus docs app in `apps/docs/`
- Optional Postgres-backed watchlists and snapshots
- Optional Upstash Redis alert deduplication
- Public HTTP metadata endpoints at `/`, `/info`, and `/health`

## Two Ways To Use The Project

### 1. Hosted MCP

Best for almost everyone.

- no local server setup
- no API keys
- connect once and start using tools

### 2. Self-hosted MCP

Best only if you need:

- your own infrastructure
- custom auth or private deployment controls
- code changes or integration work
- your own database-backed monitoring environment

## MCP Tools

- `analyze_token`: Full token due diligence report by address or token name
- `scan_risk`: Fast red-flag scan with triggered and passed checks
- `analyze_wallet`: Wallet behavior classification based on activity heuristics
- `compare_tokens`: Side-by-side comparison across key token quality metrics
- `watch_token`: Persist monitoring thresholds and baseline snapshots
- `get_token_changes`: Compare the current snapshot against the previous one and emit alerts

## What Rug Radar Optimizes For

- Speed over exhaustive chain indexing
- Structured output over long-form prose
- Partial answers instead of complete failure when one upstream source is down
- Deterministic scoring so outputs are easier to reason about

## What Rug Radar Does Not Try To Be

- A full trading terminal
- A complete forensic investigation suite
- A replacement for manual judgment
- A guarantee that a token or wallet is safe

Rug Radar is analysis infrastructure, not financial advice. Treat every output as a decision aid, not a command.
