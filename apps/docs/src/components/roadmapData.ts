export type RoadmapStatus = "done" | "in-progress" | "next" | "later";

export type RoadmapItem = {
  title: string;
  status: RoadmapStatus;
  target: string;
  summary: string;
  bullets: string[];
};

export const roadmapItems: RoadmapItem[] = [
  {
    title: "Core MCP Toolset",
    status: "done",
    target: "Released",
    summary: "Foundation tools for token and wallet due diligence are live.",
    bullets: [
      "analyze_token, scan_risk, analyze_wallet, compare_tokens",
      "watch_token and get_token_changes for monitoring deltas",
      "Hosted MCP endpoint with /health and /info public checks",
    ],
  },
  {
    title: "Structured Risk Evidence",
    status: "done",
    target: "Released",
    summary: "Risk logic and report formatting are in production use.",
    bullets: [
      "Normalized scoring and validator layers",
      "Readable report formatting optimized for agent responses",
      "Baseline snapshots for comparison-oriented workflows",
    ],
  },
  {
    title: "Confidence Layer + Source Attribution",
    status: "in-progress",
    target: "March 2026",
    summary: "Make outputs easier to trust by showing certainty and provenance.",
    bullets: [
      "Per-signal confidence score and freshness indicator",
      "Source map in each report section (Rugcheck / Dexscreener / Helius / Bags)",
      "Explicit 'why this matters' hints for non-technical traders",
    ],
  },
  {
    title: "Proactive Wallet/Token Watch Alerts",
    status: "next",
    target: "April 2026",
    summary: "Turn passive checks into active monitoring with meaningful alerts.",
    bullets: [
      "Alert presets: liquidity drop, holder concentration spike, contract flags",
      "Digest mode for top changes across watched assets",
      "Notification-ready output schema for client integrations",
    ],
  },
  {
    title: "Narrative Trade Assistant",
    status: "next",
    target: "May 2026",
    summary: "Higher-level workflow helpers that convert data to decisions.",
    bullets: [
      "\"Should I wait or size down?\" scenario prompts with evidence",
      "Pre-trade checklist generator with auto-filled risk context",
      "Counterparty reputation snapshots for recurring wallets",
    ],
  },
  {
    title: "Cross-Chain Expansion",
    status: "later",
    target: "Q3 2026",
    summary: "Extend the same due diligence UX beyond Solana.",
    bullets: [
      "EVM chain adapter model with shared risk vocabulary",
      "Chain-specific heuristics behind a unified MCP interface",
      "Comparative risk profile view across ecosystems",
    ],
  },
];
