---
id: local-development
title: Local Development
---

This page is for contributors or teams running their own Rug Radar instance. If you only want to use Rug Radar in Claude or another MCP client, use the hosted endpoint instead and skip this page.

## Repository Layout

- `src/`: MCP server, adapters, tools, utilities, and storage integrations
- `migrations/`: SQL schema
- `scripts/migrate.mjs`: migration runner
- `apps/docs/`: Docusaurus docs and landing site
- `skill/`: prompt/system artifacts

## Main Development Commands

From the repo root:

```bash
npm run dev
```

Type-check the server:

```bash
npm run typecheck
```

Build the server:

```bash
npm run build
```

Run docs locally:

```bash
npm run dev --prefix apps/docs
```

Build docs:

```bash
npm run build --prefix apps/docs
```

## Runtime Behavior

The server starts an Express app and exposes:

- `GET /`
- `GET /health`
- `GET /info`
- MCP transport at `/mcp`

Tool registration happens in `src/index.ts`.

## Common Local Workflows

### Working on token analysis

- edit files in `src/tools/analyzeToken.ts`
- check scoring changes in `src/utils/riskScore.ts`
- update docs if score interpretation changes

### Working on monitoring

- apply the migration
- make sure `DATABASE_URL` is valid
- test both `watch_token` and `get_token_changes`

### Working on docs

- edit files in `apps/docs/docs/`
- update `apps/docs/sidebars.ts` when adding pages

## Practical Advice

- prefer token addresses over token names when testing resolution logic
- test degraded behavior by omitting optional keys like `BAGS_API_KEY`
- validate both the server build and the docs build before shipping changes
