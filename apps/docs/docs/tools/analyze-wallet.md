---
id: analyze-wallet
title: analyze_wallet
---

Wallet behavior analysis for a Solana address.

## When To Use It

- Evaluating if a wallet looks systematic or random
- Checking if a wallet resembles sniper/bot/whale behavior
- Building context before copying or reacting to a wallet's actions

## Inputs

- `wallet_address` required

## What It Does

`analyze_wallet` pulls recent transactions from Helius and derives a simplified behavior profile:

- early-buyer score
- trading cadence
- average position size
- suspicious execution patterns
- most-traded tokens

It then maps the wallet into one of five labels:

- `Sniper`
- `Whale`
- `Bot`
- `Insider`
- `Retail`

## What You Receive

- Wallet type classification
- Activity profile and frequency
- Suspicious patterns
- Summary risk-to-trade-with signal
- First-seen timestamp and total transactions when available

## Heuristic Nature

This tool is intentionally heuristic.

- `Bot` usually means very high activity plus suspicious patterns
- `Whale` is driven mostly by average position size
- `Sniper` is driven by early-buyer behavior
- `Insider` is a mix of early buying and larger sizing

These labels are shortcuts, not certainty.

## Failure Behavior

If Helius is unavailable, the tool returns an incomplete fallback profile rather than crashing the whole request.

## Typical Prompts

`Analyze this wallet: <wallet address>.`
`Analyze this wallet and explain why you classified it that way.`
