---
id: openclaw
title: Using Rug Radar In OpenClaw
---

This page explains how to use Rug Radar in OpenClaw-style agent setups that support remote MCP servers.

## MCP Endpoint

Use:

`https://mcp.rugrdr.xyz`

## Typical Integration Steps

1. Open your OpenClaw agent/tool settings.
2. Add a remote MCP server.
3. Set endpoint URL to `https://mcp.rugrdr.xyz`.
4. Select Streamable HTTP transport if required by your UI.
5. Save and refresh available tools.

## Expected Tools

After connection, you should see:

- `analyze_token`
- `scan_risk`
- `analyze_wallet`
- `compare_tokens`
- `watch_token`
- `get_token_changes`

## Smoke Test Prompts

- `Analyze BONK`
- `Scan red flags for <token address>`
- `Compare BONK vs WIF`
- `What changed since last check for <token address>?`

## Troubleshooting

- If tools don't load, verify endpoint URL and transport first.
- If requests fail intermittently, retry after DNS/cache refresh.
- If you use custom auth in your own deployment, pass required headers in your client.

## Agent Workflow Recommendation

1. Start with `scan_risk` for speed.
2. Follow with `analyze_token` for context.
3. Use `watch_token` and `get_token_changes` for ongoing monitoring.
