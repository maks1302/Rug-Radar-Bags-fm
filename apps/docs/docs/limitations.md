---
id: limitations
title: Limitations
---

Rug Radar improves speed and clarity, but it is not omniscient.

## Important Limits

- Onchain data can lag or be incomplete.
- Some behavior heuristics are probabilistic, not ground truth.
- Fast-moving tokens can change materially in minutes.
- Partial source outages can reduce confidence.
- Name-based token lookup can resolve to the most liquid matching Solana pair, which may not be the asset you intended.
- Wallet analysis is heuristic-heavy and should not be treated as a verified PnL model.
- Monitoring is snapshot-based, not continuous stream processing.

## Tool-Specific Limits

### `analyze_token`

- Risk scores are deterministic but still depend on upstream freshness
- token age comes from DEX pair creation time, not necessarily the true mint creation time
- missing holder data or contract data lowers confidence and can distort interpretation

### `scan_risk`

- This is intentionally opinionated and threshold-driven
- it can miss nuanced situations that show up only in the full `analyze_token` output

### `analyze_wallet`

- Wallet type labels are heuristic classifications
- win rate is currently a rough placeholder rather than a realized PnL engine
- average hold time is an approximation

### `watch_token` and `get_token_changes`

- Alerts are only evaluated when `get_token_changes` runs
- no background scheduler is included in this repository
- baseline and delta logic depend on a working Postgres connection

## Operational Limits

- No built-in auth middleware is enabled in the current server
- The server caches upstream responses in memory only
- A process restart clears that cache
- Redis is used only for alert deduplication, not as a primary datastore

## Best Practice

- Re-run checks before entry
- Use watch + change tracking for volatile assets
- Combine with your own thesis and risk management
- Prefer token addresses over names when precision matters
- Treat low-confidence outputs as incomplete, not reassuring
