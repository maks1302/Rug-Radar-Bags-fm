import "dotenv/config";

import express from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { analyzeToken, analyzeTokenErrorFallback } from "./tools/analyzeToken.js";
import { analyzeWallet } from "./tools/analyzeWallet.js";
import { scanRisk } from "./tools/scanRisk.js";
import { compareTokens } from "./tools/compareTokens.js";
import { watchToken } from "./tools/watchToken.js";
import { getTokenChanges } from "./tools/getTokenChanges.js";

const VERSION = "1.0.0";
const PORT = Number(process.env.PORT ?? 3000);

function jsonToolResult<T extends object>(result: T) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
    structuredContent: result as unknown as Record<string, unknown>,
  };
}

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "rug-radar",
    version: VERSION,
  });

  server.registerTool(
    "analyze_token",
    {
      title: "Analyze Token",
      description: "Full token due diligence report for a Solana token by address or name.",
      inputSchema: {
        token_address: z.string().optional(),
        token_name: z.string().optional(),
      },
    },
    async (args) => {
      try {
        const result = await analyzeToken(args);
        return jsonToolResult(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown analyze_token error";
        const fallback = analyzeTokenErrorFallback(args, message);
        return jsonToolResult(fallback);
      }
    },
  );

  server.registerTool(
    "watch_token",
    {
      title: "Watch Token",
      description: "Creates or updates a DB-backed watch rule set for a token and stores a baseline snapshot.",
      inputSchema: {
        token_address: z.string(),
        user_id: z.string().optional(),
        liquidity_drop_percent: z.number().optional(),
        risk_score_increase: z.number().optional(),
        holder_concentration_increase: z.number().optional(),
        alert_on_authority_change: z.boolean().optional(),
        alert_on_honeypot: z.boolean().optional(),
      },
    },
    async (args) => {
      try {
        const result = await watchToken(args);
        return jsonToolResult(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown watch_token error";
        return jsonToolResult({
          error: message,
          note: "watch_token requires DATABASE_URL and successful DB migration.",
        });
      }
    },
  );

  server.registerTool(
    "get_token_changes",
    {
      title: "Get Token Changes",
      description:
        "Loads previous token snapshot from DB, computes risk/liquidity/holder deltas, and triggers watchlist alerts.",
      inputSchema: {
        token_address: z.string(),
        user_id: z.string().optional(),
      },
    },
    async (args) => {
      try {
        const result = await getTokenChanges(args);
        return jsonToolResult(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown get_token_changes error";
        return jsonToolResult({
          error: message,
          note: "get_token_changes requires DATABASE_URL, DB migration, and baseline snapshots.",
        });
      }
    },
  );

  server.registerTool(
    "analyze_wallet",
    {
      title: "Analyze Wallet",
      description: "Analyzes Solana wallet behavior including style, cadence, and suspicious patterns.",
      inputSchema: {
        wallet_address: z.string(),
      },
    },
    async (args) => {
      const result = await analyzeWallet(args);
      return jsonToolResult(result);
    },
  );

  server.registerTool(
    "scan_risk",
    {
      title: "Scan Risk",
      description: "Fast red-flag scan for a Solana token with severity levels.",
      inputSchema: {
        token_address: z.string(),
      },
    },
    async (args) => {
      const result = await scanRisk(args);
      return jsonToolResult(result);
    },
  );

  server.registerTool(
    "compare_tokens",
    {
      title: "Compare Tokens",
      description: "Compares two Solana tokens side-by-side and returns a healthier pick.",
      inputSchema: {
        token_a: z.string(),
        token_b: z.string(),
      },
    },
    async (args) => {
      const result = await compareTokens(args);
      return jsonToolResult(result);
    },
  );

  return server;
}

async function bootstrap(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  const server = createMcpServer();

  const transports = new Map<string, StreamableHTTPServerTransport>();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", version: VERSION });
  });

  const infoPayload = {
      name: "Rug Radar",
      tagline: "Instant token and wallet due diligence inside Claude.",
      version: VERSION,
      tools: [
        "analyze_token",
        "analyze_wallet",
        "scan_risk",
        "compare_tokens",
        "watch_token",
        "get_token_changes",
      ],
      endpoints: {
        health: "/health",
        mcp: "/mcp",
        info: "/info",
      },
  };

  app.get("/info", (_req, res) => {
    res.json(infoPayload);
  });

  app.get("/", (_req, res) => {
    res.json(infoPayload);
  });

  app.all("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports.has(sessionId)) {
      transport = transports.get(sessionId)!;
    } else {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
          transports.set(newSessionId, transport);
        },
        // Keep stateless mode off so clients can reuse sessions.
        enableJsonResponse: true,
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          transports.delete(transport.sessionId);
        }
      };

      await server.connect(transport);
    }

    try {
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("[mcp] transport error", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "MCP transport error" });
      }
    }
  });

  app.listen(PORT, () => {
    console.log(`Rug Radar server listening on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Fatal boot error:", error);
  process.exit(1);
});
