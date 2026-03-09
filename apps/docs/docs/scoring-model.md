---
id: scoring-model
title: Scoring Model
---

This page describes how Rug Radar calculates token risk today.

## Core Principle

Higher score means more visible risk.

The score is deterministic. Given the same upstream inputs, Rug Radar will produce the same risk score and label.

## Major Inputs

The risk model in `src/utils/riskScore.ts` weighs:

- holder concentration
- liquidity depth
- honeypot status
- mint authority
- freeze authority
- verification status
- token age
- volume-consistency risk
- heuristic dev-wallet concentration

## Score Bands

- `0-25`: `Low Risk`
- `26-50`: `Medium Risk`
- `51-75`: `High Risk`
- `76-100`: `Extreme Risk`

## Scoring Logic In Practice

### Holder concentration

Large top-10 concentration is one of the strongest risk drivers.

- above `80%` adds the largest penalty
- above `60%` is still a major problem
- healthier distribution produces a bullish signal instead

### Liquidity

Thin liquidity is heavily penalized.

- under `$10k` is treated as very thin
- under `$50k` is still risky
- deeper liquidity produces a bullish signal

### Contract controls

The following can materially increase risk:

- honeypot detected
- active mint authority
- active freeze authority
- contract not verified

### Token age

Very new tokens receive extra risk points because many early-stage failures happen before the token has survived any real time.

### Volume consistency

If 24 hour volume is very high relative to liquidity and price action is extreme, the model can add a smaller penalty for suspicious short-lived spikes.

### Dev wallet concentration

If the largest visible holder looks outsized, the model applies an additional bump to reflect concentration risk.

## Confidence

Confidence is not part of the raw score. It is reported alongside the score and reflects upstream source availability.

The implementation uses:

```text
available_sources / total_sources
```

So a run with only half the expected data sources available will naturally have lower confidence even if the score itself appears moderate.

## Bags Adjustments

After the base score is computed, `analyze_token` can apply small Bags-driven adjustments:

- strong community score can reduce risk slightly
- no Bags pool can increase risk slightly
- high creator claim share can increase risk slightly

These adjustments are deliberately small compared with structural signals like concentration or honeypot status.

## What The Model Is Not

- It is not a machine-learned probability of a rug
- it is not a price forecast
- it is not a substitute for manual inspection

It is a compact ranking and triage mechanism.
