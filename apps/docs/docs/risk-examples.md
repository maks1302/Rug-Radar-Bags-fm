---
id: risk-examples
title: Risk Score Examples
---

Use these examples to interpret outputs quickly.

## Example A: High Risk Setup

- Risk: `68 / 100`
- Top10 holders: `72%`
- Liquidity: `$40k`
- Mint authority: `active`

Interpretation: concentration + thin liquidity + authority risk combine into a fragile profile.

## Example B: Medium Risk Setup

- Risk: `41 / 100`
- Top10 holders: `46%`
- Liquidity: `$240k`
- Contract: verified, no honeypot flag

Interpretation: mixed profile. Not obviously broken, but still requires position sizing discipline.

## Example C: Extreme Risk Setup

- Risk: `84 / 100`
- Honeypot: `true`
- Top10 holders: `>80%`
- Token age: very new

Interpretation: avoid unless you have a very specific high-risk strategy.
