---
id: deployment
title: Deployment
---

This page is for self-hosting. If your goal is only to use Rug Radar, prefer the hosted MCP endpoint at `https://mcp.rugrdr.xyz/mcp`.

The repository is split into two deployable surfaces:

- the MCP/API server
- the docs/landing site

## Current Intended Split

### Docs and landing

- project root: `apps/docs`
- build command: `npm run build`
- output: `build`

### MCP/API server

- project root: repository root
- build command: `npm run build`
- start command: `npm run start`
- default port: `3000`

## Environment Planning

At minimum for the API deployment, decide whether you want:

- token and wallet analysis only
- or the full watchlist/snapshot/alert feature set

For token and wallet analysis, `HELIUS_API_KEY` is the main requirement.

For the full feature set, add:

- `DATABASE_URL`
- optional Redis credentials
- optional `BAGS_API_KEY`

## Health And Metadata Endpoints

After deployment, verify:

- `/health`
- `/info`

These endpoints are the fastest sanity check before testing MCP behavior.

## Practical Production Notes

- the current code exposes public endpoints without built-in auth middleware
- if you are running a public deployment, add auth in front of `/mcp`
- if you rely on monitoring, make sure database migrations run before first traffic
- Redis is recommended if repeated `get_token_changes` runs are expected

## Build Validation

Before shipping:

```bash
npm run build
npm run build --prefix apps/docs
```

If either build fails, fix that first. The docs and server are independent deployables, but both should stay green.
