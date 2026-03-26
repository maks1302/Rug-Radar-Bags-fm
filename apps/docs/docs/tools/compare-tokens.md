---
id: compare-tokens
title: compare_tokens
---

Side-by-side token health comparison.

## When To Use It

- Choosing between two candidates
- Sanity-checking relative risk
- Replacing "is this good?" with "which one is healthier?"

## Inputs

- `token_a` required
- `token_b` required

Each input can be either a token name or a Solana token address.

## What It Does

`compare_tokens` runs `analyze_token` for both candidates and compares them across:

- risk score
- holder concentration
- liquidity
- volume
- market cap
- contract safety
- token age

It counts category wins and returns a healthier pick or a tie.

## What You Receive

- Risk scores for both tokens
- Confidence scores for both tokens
- Per-token source availability and freshness metadata
- Category winners (liquidity, concentration, etc.)
- Comparison caveats when one side has weaker or incomplete upstream coverage
- Healthier pick with reasoning
- A recommendation string that summarizes the comparison

## Interpretation Advice

- this tool is best for ranking candidates, not proving safety
- a winner can still be a bad trade if both tokens are weak
- if the winner has lower confidence or missing sources, treat the result as provisional
- if the output is a tie, the right answer is often to wait or reduce size

## Typical Prompts

`Compare <token A> vs <token B>.`
`Compare <A> vs <B> and focus on which one has better structural quality.`
