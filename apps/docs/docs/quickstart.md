---
id: quickstart
title: Quickstart In 3 Minutes
---

This page is for users of the already deployed Rug Radar MCP. If you only want to use the hosted version, this is the page that matters.

## Step 1: Connect To The Hosted MCP

Use this MCP endpoint in your client:

`https://mcp.rugrdr.xyz`

If your client asks for transport, use Streamable HTTP when applicable.

After connection, you should see these tools:

- `analyze_token`
- `scan_risk`
- `analyze_wallet`
- `compare_tokens`
- `watch_token`
- `get_token_changes`

You do not need to clone the repo for this path.

## Step 2: Run The Fastest Useful Workflow

### 1. Start with a full token report

Prompt:

`Analyze <token address> and give me a plain-English verdict.`

Why:

- `analyze_token` is the richest single tool
- it combines market, holder, contract, and Bags context
- it returns both a risk score and the reasons behind it

Use this first when you are looking at a token for the first time.

### 2. Follow with fast risk mode

Prompt:

`Scan red flags for <token address>. Keep it short.`

Why:

- `scan_risk` reduces noise
- it highlights concrete failure conditions such as high holder concentration, thin liquidity, active authorities, or honeypot detection
- it is useful when you want a quick go/no-go read

### 3. Compare alternatives instead of judging in isolation

Prompt:

`Compare <token A> vs <token B> and pick the healthier one.`

Why:

- many trading decisions are relative, not absolute
- `compare_tokens` makes tradeoffs visible across risk, liquidity, volume, market cap, contract safety, and age

### 4. Turn a one-off check into monitoring

If the token is still relevant after the first pass:

1. `Watch <token address> with 20% liquidity-drop threshold and alert on honeypot`
2. `What changed since last check for <token address>?`

Why:

- `watch_token` stores your thresholds and a baseline snapshot
- `get_token_changes` computes deltas against the last stored snapshot
- alerts are tied to measurable conditions instead of vague sentiment

## Suggested Prompt Set

- `Analyze BONK and summarize risk in plain English`
- `Scan red flags for So11111111111111111111111111111111111111112`
- `Compare BONK vs WIF and tell me which is healthier`
- `Analyze this wallet: <wallet address>`
- `Watch <token address> with 15% liquidity drop and 8 point risk score increase`
- `What changed since last check for <token address>?`

## When To Use Which Tool

- Use `analyze_token` when you need the full story
- Use `scan_risk` when you need the shortest risk-focused answer
- Use `analyze_wallet` when you are evaluating whether a wallet is worth following
- Use `compare_tokens` when deciding between two candidates
- Use `watch_token` and `get_token_changes` when the token remains on your radar over time

## Golden Rule

Use Rug Radar to reduce blind spots, not to outsource judgment. Re-run checks before entry if the market is moving quickly.
