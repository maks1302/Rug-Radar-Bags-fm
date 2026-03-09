---
id: data-sources
title: Data Sources Behind Results
---

Rug Radar deliberately combines multiple upstreams so no single provider determines the verdict. Each source covers a different risk surface.

## Source Map

### DEX Screener

Used for token market context.

- token identity when searching by name
- price
- FDV
- market cap
- 24 hour volume
- liquidity
- 24 hour price change
- pair creation timestamp

Implementation detail:

- when multiple pairs exist, Rug Radar selects the pair with the highest liquidity
- for name-based lookups, only Solana pairs are considered

### RugCheck

Used for contract and market-structure safety signals.

- verification status
- honeypot status
- mint authority
- freeze authority
- RugCheck score
- LP unlock or LP burn interpretation

Implementation detail:

- authority values are normalized into booleans
- Rug Radar treats missing authority strings as "renounced" when the upstream explicitly returns `null`

### Helius

Used for both token-holder analytics and wallet behavior analysis.

For token analysis:

- top holder distribution
- total holder count
- top 10 concentration
- largest holder share
- heuristic dev wallet concentration
- heuristic wallet clustering score

For wallet analysis:

- recent transactions
- activity cadence
- average position size
- rough early-buyer score
- wallet type heuristics

### Bags

Used for ecosystem participation and creator/claim context.

- creator identity/provider metadata
- lifetime fees
- claim stats
- recent claim activity
- Bags pool presence
- creator claim share
- derived community score

Implementation detail:

- Bags is optional and requires `BAGS_API_KEY`
- if the key is missing, Rug Radar still works and marks Bags as unavailable

## Why Multi-Source Matters

- market quality alone can look healthy while contract permissions are still dangerous
- contract checks alone do not explain holder concentration or liquidity fragility
- wallet-activity heuristics are useful, but weak without token context
- Bags adds a different kind of adoption and participation signal that pure market APIs do not capture

## Partial Availability Behavior

Rug Radar does not fail closed when one provider is down. Instead:

- the tool still returns a structured result
- unavailable providers are listed in `meta.dataSources`
- missing upstream coverage lowers effective confidence
- users can decide whether to wait for another run or proceed with incomplete context

This behavior is intentional. In fast markets, partial visibility is often better than no visibility, as long as the uncertainty is made explicit.
