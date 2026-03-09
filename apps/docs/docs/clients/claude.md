---
id: claude
title: Using Rug Radar In Claude
---

Claude users should use the hosted Rug Radar MCP unless they have a specific reason to self-host.

## What You Need

- A configured Rug Radar MCP endpoint: `https://mcp.rugrdr.xyz`
- Prompts in plain language (Claude maps intent to tools)

## Typical Flow

1. Ask: `Analyze <token>`
2. Ask follow-up: `Scan red flags only`
3. Ask compare: `Compare <A> vs <B>`
4. For monitoring: `Watch <token>` then `What changed since last check?`

## Prompt Tips

- Be explicit about what you want: short verdict vs full report.
- Ask for "simple version" if you want non-technical summaries.
