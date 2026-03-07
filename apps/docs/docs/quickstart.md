---
id: quickstart
title: Quickstart In Claude
---

## 1. Ask a Direct Question

Start with natural prompts like:
- `Analyze BONK`
- `Scan red flags for <token address>`
- `Analyze this wallet: <wallet address>`
- `Compare BONK vs WIF`

## 2. Use The Right Tool Intent

- Deep report: `analyze_token`
- Fast safety check: `scan_risk`
- Wallet behavior: `analyze_wallet`
- Side-by-side pick: `compare_tokens`
- Save monitoring rules: `watch_token`
- Check what changed: `get_token_changes`

## 3. Read The Verdict + Flags

Focus first on:
- Risk score + label
- Top red flags
- Data availability notes

## 4. Re-check Before Trading

For volatile tokens, run:
- `watch_token` once
- `get_token_changes` periodically

This catches late changes like liquidity drops or authority flips.
