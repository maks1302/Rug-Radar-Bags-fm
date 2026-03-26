---
id: scan-risk
title: scan_risk
---

Fast red-flag mode with minimal noise.

## When To Use It

- Quick go/no-go checks
- Volatile moments
- Short summaries for chats
- A fast second opinion after `analyze_token`

## Inputs

- `token_address` required

## What It Does

`scan_risk` runs `analyze_token` first, then applies a fixed set of threshold checks such as:

- top 10 holders above 60%
- LP unlocked
- active mint authority
- active freeze authority
- suspicious volume/liquidity ratio
- token age under 7 days
- honeypot detected
- largest holder above 15%
- clustering or concentration flags
- liquidity under $50k

## What You Receive

- Risk level
- Confidence score
- Triggered flags with severity
- Passed checks
- Short verdict
- Source availability metadata so you can see if the scan was partial

## Why It Exists

This tool is intentionally narrower than `analyze_token`. It is optimized for fast decisions and short shareable outputs.

If confidence is lower or sources are unavailable, treat the result as a fast triage pass rather than a final answer.

## Typical Prompts

`Scan red flags for <token>.`
`Give me a short go/no-go scan for <token address>.`
