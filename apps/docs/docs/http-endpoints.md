---
id: http-endpoints
title: HTTP Endpoints
---

Rug Radar exposes a small HTTP surface in addition to the MCP tool transport.

## `GET /`

Returns the same general metadata payload used by `/info` for human-friendly access.

Typical fields:

- project name
- tagline
- version
- list of tools
- endpoint map

## `GET /health`

Lightweight health check.

Returns:

- `status`
- `version`

This is the best endpoint for uptime checks and deploy verification.

## `GET /info`

Project metadata endpoint.

Returns:

- project name
- tagline
- version
- tool list
- endpoint paths

## `/mcp`

MCP transport endpoint used by remote MCP clients.

Implementation detail:

- the server uses `StreamableHTTPServerTransport`
- sessions are tracked in memory
- session IDs are generated with UUIDs

## CORS Behavior

`/health` and `/info` expose permissive CORS headers for public read-only checks.

## Notes

- the root endpoint is not a separate product API; it is a lightweight metadata response
- there is no separate REST endpoint per tool in this repository
- tool invocation happens through MCP
