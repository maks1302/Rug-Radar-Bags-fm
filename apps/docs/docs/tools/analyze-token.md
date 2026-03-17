---
id: analyze-token
title: analyze_token
---

Deep token due diligence for a Solana token by address or name.

## When To Use It

- Full token health review
- Pre-trade context
- Shareable research summaries
- Any first-pass investigation where you want the most complete view Rug Radar can provide

## Inputs

- `token_address` optional
- `token_name` optional

At least one must be provided.

## What It Does

`analyze_token` orchestrates four upstream perspectives:

- DEX Screener for market context
- RugCheck for contract safety
- Helius for holder concentration
- Bags for ecosystem participation context

It then computes a deterministic risk score and returns structured metadata about source availability and freshness.

## What You Receive

- token identity, symbol, address, chain, and approximate age
- market metrics such as price, liquidity, volume, market cap, and FDV where available
- contract safety fields including honeypot, authorities, LP status, and verification
- holder concentration metrics
- risk score, label, confidence, bullish signals, and red flags
- metadata about which sources were available or unavailable
- per-source freshness metadata including fetch time, cache status, and a `live` / `recent` / `stale` label

## Risk Model Notes

The score is driven primarily by:

- top-holder concentration
- liquidity depth
- contract permissions and honeypot status
- token age
- volume consistency

The Bags integration can adjust the score slightly up or down based on community and fee-share context.

## Failure Behavior

- invalid addresses throw an input error
- source outages do not necessarily fail the entire tool
- if the full analysis cannot be assembled, the tool can return a fallback result with extreme-risk defaults and unavailable sources

## Typical Prompts

`Analyze <token> and give me a plain-English verdict.`
`Analyze <token> and focus on contract permissions and holder concentration.`
`Analyze <token address> and tell me whether the risk is improving or deteriorating.`
