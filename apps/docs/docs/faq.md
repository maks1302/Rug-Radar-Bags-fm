---
id: faq
title: FAQ
---

## Is Rug Radar financial advice?

No. It is an analysis tool.

## What chain does Rug Radar support?

The implementation in this repository is Solana-specific.

## Why does the same token sometimes get a different score later?

Market, liquidity, holder distribution, and contract-status observations can change quickly. Scores are time-dependent snapshots, not permanent labels.

## What if data is missing?

You still get partial output plus source availability notes. Confidence may be lower.

## What does confidence mean?

Confidence is a completeness signal. It reflects how many of the expected upstream sources returned usable data for that run.

## Can I use token names instead of addresses?

Yes for `analyze_token` and `compare_tokens`, but addresses are safer. Name lookups rely on search results and choose the most liquid Solana pair match.

## How do watch features work?

- `watch_token` stores monitoring rules + a baseline snapshot.
- `get_token_changes` compares against the previous snapshot and shows triggered alerts.

## Are alerts pushed automatically?

No. This repository stores watchlists, snapshots, and alerts, but alert evaluation happens when `get_token_changes` is called.

## What storage is required?

- `analyze_token`, `scan_risk`, `analyze_wallet`, and `compare_tokens` can run without Postgres or Redis
- `watch_token` and `get_token_changes` require `DATABASE_URL`
- Redis is optional and only improves alert deduplication

## Why might a wallet be labeled `Bot` or `Sniper`?

Those labels come from heuristic rules based on trading cadence, early-buy behavior, position sizing, and suspicious patterns. They are descriptive shortcuts, not identity proof.

## Should I copy wallets labeled as smart?

No automatic copying is recommended. Use wallet classification as context, not a trading command.
