---
id: watch-token
title: watch_token
---

Creates monitoring rules for a token.

## When To Use It

- Ongoing tracking without repeating full manual checks
- Defining your own risk-change thresholds
- Establishing a baseline before entering or sharing a token

## Inputs

- `token_address` required
- `user_id` optional
- `preset` optional: `balanced`, `liquidity_guard`, `concentration_guard`, `contract_guard`
- `liquidity_drop_percent` optional
- `risk_score_increase` optional
- `holder_concentration_increase` optional
- `alert_on_authority_change` optional
- `alert_on_honeypot` optional

## What It Does

`watch_token` upserts a watchlist row and stores a baseline token snapshot. It is the setup step for future `get_token_changes` calls.

## Default Thresholds

- liquidity drop: `20%`
- risk score increase: `10`
- holder concentration increase: `5`
- authority change alerts: `true`
- honeypot alerts: `true`

## Presets

- `balanced`: default general-purpose watch
- `liquidity_guard`: tighter liquidity-drop and risk-change thresholds
- `concentration_guard`: faster alerts for holder concentration spikes
- `contract_guard`: stricter contract-risk posture with looser market thresholds

Manual threshold inputs override the preset when both are supplied.

## What You Receive

- Watch configuration confirmation
- Baseline snapshot used for future delta checks
- A note that points you to `get_token_changes`

## Storage Requirements

This tool requires:

- `DATABASE_URL`
- the migration in `migrations/001_init.sql`

## Typical Prompts

`Watch <token address> with 20% liquidity drop alert.`
`Watch <token> with 12 point risk score increase and authority-change alerts.`
`Watch <token> with the liquidity_guard preset.`
