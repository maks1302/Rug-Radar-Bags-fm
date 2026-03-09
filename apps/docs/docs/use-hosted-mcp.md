---
id: use-hosted-mcp
title: Use The Hosted MCP
---

This is the main way to use Rug Radar.

If your goal is to analyze tokens and wallets, you do not need to clone the repository, install dependencies, or run a server yourself. Just connect your MCP client to the already deployed endpoint:

`https://mcp.rugrdr.xyz`

## Who This Path Is For

- traders who just want the tools
- researchers who want fast MCP access
- communities using Claude or another MCP-compatible client
- anyone who does not need custom infrastructure

## What You Need

- an MCP-compatible client
- the Rug Radar endpoint: `https://mcp.rugrdr.xyz`

That is it.

## What Happens After Connection

Your client should discover these tools:

- `analyze_token`
- `scan_risk`
- `analyze_wallet`
- `compare_tokens`
- `watch_token`
- `get_token_changes`

## Best First Prompts

- `Analyze BONK`
- `Scan red flags for <token address>`
- `Analyze this wallet: <wallet address>`
- `Compare BONK vs WIF`
- `Watch <token address> with 20% liquidity-drop threshold`
- `What changed since last check for <token address>?`

## When You Should Self-Host Instead

Only choose the self-hosting path if you need one of these:

- code changes
- a private deployment
- custom auth or network controls
- your own Postgres or Redis-backed environment
- infrastructure ownership for reliability or compliance reasons

For everyone else, the hosted endpoint is the correct default.
