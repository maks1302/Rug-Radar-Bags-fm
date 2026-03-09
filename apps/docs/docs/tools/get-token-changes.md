---
id: get-token-changes
title: get_token_changes
---

Checks what changed since the last snapshot.

## When To Use It

- Follow-up checks after setting watch rules
- Detecting worsening conditions quickly
- Turning one-off analysis into a repeatable monitoring loop

## Inputs

- `token_address` required
- `user_id` optional

## What It Does

`get_token_changes`:

1. loads the latest saved snapshot for the token from Postgres
2. runs a fresh `analyze_token`
3. stores the new snapshot
4. computes deltas against the previous snapshot
5. evaluates any active watchlists
6. inserts deduplicated alerts

## What You Receive

- Previous vs current metrics
- Delta list (risk/liquidity/holders/contract changes)
- Triggered alerts that match your watch rules
- A note indicating whether this was the first stored snapshot or a real delta run

## Metrics Compared

- risk score
- liquidity
- top 10 holder concentration
- mint authority
- freeze authority
- honeypot status

## Alert Types

- `risk_score_increase`
- `liquidity_drop`
- `holder_concentration_increase`
- `authority_change`
- `honeypot_detected`

## Storage Requirements

This tool requires:

- `DATABASE_URL`
- the initial migration to be applied

Redis is optional but recommended for alert deduplication.

## Typical Prompts

`What changed since last check for <token address>?`
`Check <token> against the previous snapshot and only tell me the material changes.`
