---
id: monitoring-internals
title: Monitoring Internals
---

This page documents how watchlists, snapshots, and alert deduplication work internally.

## Watchlists

Watch rules are stored in Postgres as JSON under `watchlists.rules_json`.

Normalized rule shape:

- `liquidityDropPercent`
- `riskScoreIncrease`
- `holderConcentrationIncrease`
- `alertOnAuthorityChange`
- `alertOnHoneypot`

## Snapshots

Snapshots are full serialized analysis payloads stored in `token_snapshots.snapshot_json`, plus selected scalar fields for easier querying.

Rug Radar stores:

- the full snapshot JSON
- risk score
- liquidity
- top-10 concentration

## Change Extraction

`get_token_changes` computes deltas across a limited set of fields rather than diffing every nested value.

Current tracked fields:

- risk score
- liquidity
- top-10 concentration
- mint authority
- freeze authority
- honeypot status

## Alert Evaluation

For each active watchlist on the token, Rug Radar checks:

- risk score rise above threshold
- liquidity drop percentage above threshold
- holder concentration increase above threshold
- authority status change
- honeypot flip from not true to true

## Dedupe Strategy

Before inserting an alert, the server computes a dedupe key using:

- watchlist ID
- trigger type
- a 10-minute time bucket

That key is written into Redis with `NX` and a TTL. If Redis says the key already exists, the alert is skipped.

## Why Redis Is Optional

If Redis is unavailable:

- the server allows alert creation to proceed
- monitoring remains functional
- duplicate alerts become more likely

This is a deliberate availability-over-perfect-deduplication tradeoff.
