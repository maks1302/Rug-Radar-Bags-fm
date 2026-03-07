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

## What To Do

- Re-run after short delay.
- Confirm trend across multiple checks.
- Avoid single-point conclusions.
