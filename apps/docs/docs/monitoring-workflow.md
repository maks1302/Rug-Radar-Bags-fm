---
id: monitoring-workflow
title: Watch And Change Workflow
---

Monitoring in Rug Radar is intentionally simple: store a baseline, take a new snapshot later, compute deltas, and trigger alerts if thresholds are crossed.

## Why Use Monitoring

Single scans answer "what is true right now?" Monitoring answers "what changed since I cared enough to save a baseline?"

This matters because many failures are not visible on the first check:

- liquidity can disappear after entry interest arrives
- holder concentration can worsen after redistribution
- authorities can change
- honeypot status can flip
- risk can stack over several hours instead of all at once

## Workflow

### 1. Create a watch

Prompt:

`Watch <token address> with your thresholds`

What happens:

- Rug Radar normalizes thresholds
- upserts a watchlist row in Postgres
- runs `analyze_token`
- stores the current analysis as the baseline snapshot

### 2. Re-check later

Prompt:

`What changed since last check for <token address>?`

What happens:

- Rug Radar loads the latest stored snapshot for the token
- runs a fresh `analyze_token`
- stores the new snapshot
- computes deltas across selected metrics
- evaluates watchlist thresholds
- stores alerts that pass deduplication

### 3. Review the delta set

The change report focuses on:

- `riskScore`
- `liquidity`
- `top10HoldersPercent`
- `mintAuthority`
- `freezeAuthority`
- `honeypotStatus`

### 4. Treat trends as more important than single candles

One noisy check can mislead. Repeated deterioration is much more actionable.

## Suggested Cadence

- High volatility: every 15-30 minutes
- Normal conditions: every few hours

## Default Thresholds

If you do not supply custom thresholds, Rug Radar uses:

- `liquidityDropPercent`: `20`
- `riskScoreIncrease`: `10`
- `holderConcentrationIncrease`: `5`
- `alertOnAuthorityChange`: `true`
- `alertOnHoneypot`: `true`

## Important Caveat

This repository does not include a background scheduler. Watches are stored continuously, but alert evaluation only happens when `get_token_changes` runs.
