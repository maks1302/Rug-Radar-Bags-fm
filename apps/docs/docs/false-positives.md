---
id: false-positives
title: Common False Positives
---

Some alerts can trigger without a rug scenario.

## Typical Cases

- New token volatility spikes early risk metrics.
- Liquidity moves during normal LP migrations.
- Holder concentration appears high before wider distribution.
- Temporary API lag creates short-lived metric mismatch.
- The most liquid pair found by search is not the pair you meant to inspect.
- Wallets that trade frequently for legitimate market-making reasons can look bot-like.

## What To Do

- Re-run after short delay.
- Confirm trend across multiple checks.
- Avoid single-point conclusions.
- Prefer direct token addresses over names.
- Read confidence and source availability before reacting.
