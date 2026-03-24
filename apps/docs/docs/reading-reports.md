---
id: reading-reports
title: How To Read Reports
---

This page explains how to interpret the main fields that appear in Rug Radar outputs.

## 1. Risk Score

- 0-25: Low Risk
- 26-50: Medium Risk
- 51-75: High Risk
- 76-100: Extreme Risk

Higher score means more visible risk, not guaranteed failure.

Interpret the score as a compression layer:

- low scores suggest fewer obvious structural problems
- medium scores usually mean mixed quality
- high and extreme scores mean multiple risk factors are stacking

## 2. Confidence

Confidence reflects data completeness for that run.

- higher confidence means more expected upstream sources returned usable data
- lower confidence means you are operating with partial visibility
- low confidence is not a bullish signal; it is uncertainty

## 3. Red Flags vs Bullish Signals

- red flags describe what can go wrong
- `redFlagDetails` adds a short explanation of why each flag matters
- bullish signals describe what currently looks healthier
- neither section is a price prediction

You should care most when several red flags point to the same failure mode, for example:

- thin liquidity plus concentrated holders
- active mint authority plus a very new token
- honeypot signal plus poor liquidity

## 4. Source Notes

- every result includes source availability metadata
- `analyze_token` also includes `meta.sectionSources` so you can trace each section back to its upstream providers
- every source can also include freshness metadata
- unavailable sources are listed explicitly
- if key sources are missing, interpret the score conservatively

Freshness labels are a practical read on how old the source payload is inside Rug Radar:

- `live`: very recent
- `recent`: still usable, but not immediate
- `stale`: old enough that a re-run is worth considering before acting

## 5. Token Age

Token age is currently derived from the DEX pair creation time. It is useful, but it is not the same thing as a canonical mint-creation timestamp.

## 6. Holder Metrics

The most important holder fields are:

- `top10Percent`: how much of supply the top 10 wallets control
- `largestHolder`: the largest visible wallet share
- `concentration`: a simplified label derived from top 10 concentration

High concentration does not always mean a rug, but it does mean distribution risk is real.

## 7. Contract Fields

The highest-signal contract fields are:

- `isHoneypot`
- `mintAuthority`
- `freezeAuthority`
- `lpUnlocked`
- `isVerified`

These are structural controls, not market sentiment. They deserve heavier weight than short-term price movement.

## 8. What To Do With A Mixed Report

If a report shows both healthy and unhealthy signals:

1. look at the red flags first
2. check confidence
3. compare the token against an alternative
4. re-run after a short interval if the market is moving fast
