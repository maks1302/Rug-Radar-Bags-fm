---
id: installation
title: Self-Hosting Installation
---

This page covers the self-hosting path. Most users do not need this page, because they can use the already deployed MCP endpoint directly at `https://mcp.rugrdr.xyz`.

Use this page only if you want to run your own copy of the server.

## Requirements

- Node.js `18+`
- npm
- a Solana-capable MCP client if you want to test the server through an agent

Optional but important for full functionality:

- Postgres
- Upstash Redis
- API access for Helius
- API access for Bags

## Install Dependencies

From the repository root:

```bash
npm install
```

For the docs site:

```bash
npm install --prefix apps/docs
```

## Prepare Environment

Create a local environment file:

```bash
cp .env.example .env
```

Populate the variables you have. The only truly required upstream key for meaningful token and wallet analysis is `HELIUS_API_KEY`.

If you want monitoring features, you also need `DATABASE_URL`.

## Apply Database Migration

If you plan to use `watch_token` or `get_token_changes`:

```bash
npm run migrate
```

## Start The Server

```bash
npm run dev
```

The MCP/HTTP server defaults to port `3000`.

## Start The Docs App

In a separate terminal:

```bash
npm run dev --prefix apps/docs
```

## Verify The Server

Check these endpoints locally:

- `http://localhost:3000/health`
- `http://localhost:3000/info`
- `http://localhost:3000/mcp`

The docs app runs separately through Docusaurus.
