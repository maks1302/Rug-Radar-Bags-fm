import { getJsonWithCache } from "../utils/http.js";

const HELIUS_BASE = "https://api.helius.xyz/v0";

interface HeliusHolder {
  owner?: string;
  amount?: number | string;
  uiAmount?: number;
  uiAmountString?: string;
}

interface HeliusTx {
  signature?: string;
  timestamp?: number;
  tokenTransfers?: Array<{
    mint?: string;
    tokenAmount?: number;
    tokenStandard?: string;
  }>;
  nativeTransfers?: Array<{
    amount?: number;
  }>;
  type?: string;
}

export interface HeliusHolderSnapshot {
  top20: Array<{ wallet: string; percent: number }>;
  totalHolders: number | null;
  top10Percent: number | null;
  largestHolder: number | null;
  devWalletPercent: number | null;
  suspiciousClusterScore: number | null;
}

export interface WalletBehaviorSnapshot {
  firstSeen: string | null;
  totalTransactions: number;
  trades: Array<{
    signature: string;
    timestamp: number;
    token: string;
    side: "buy" | "sell" | "unknown";
    amountUsd: number;
    pnlUsd: number | null;
  }>;
  avgHoldMinutes: number;
  winRate: number;
  avgPositionSize: number;
  tradingFrequency: string;
  earlyBuyerScore: number;
  suspiciousPatterns: string[];
  notableWins: Array<{ token: string; pnlUsd: number }>;
}

function requireHeliusApiKey(): string {
  const key = process.env.HELIUS_API_KEY;
  if (!key) {
    throw new Error("HELIUS_API_KEY is missing");
  }
  return key;
}

function parseNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }
  return 0;
}

export async function fetchTopHolders(tokenAddress: string): Promise<HeliusHolderSnapshot> {
  const apiKey = requireHeliusApiKey();
  const url = `${HELIUS_BASE}/token-holdings?api-key=${apiKey}&mint=${tokenAddress}`;
  const data = await getJsonWithCache<HeliusHolder[]>(`helius:holders:${tokenAddress}`, url, 30_000);

  const normalized = (data ?? []).map((h) => ({
    wallet: h.owner ?? "unknown",
    amount: parseNumber(h.uiAmount ?? h.uiAmountString ?? h.amount),
  }));

  const total = normalized.reduce((acc, item) => acc + item.amount, 0);
  const sorted = [...normalized].sort((a, b) => b.amount - a.amount).slice(0, 20);

  const top20 = sorted.map((h) => ({
    wallet: h.wallet,
    percent: total > 0 ? (h.amount / total) * 100 : 0,
  }));

  const top10Percent = top20.slice(0, 10).reduce((acc, h) => acc + h.percent, 0);
  const largestHolder = top20[0]?.percent ?? null;

  // Heuristic: first holder as possible dev wallet when concentration is outsized.
  const devWalletPercent = largestHolder && largestHolder > 8 ? largestHolder : null;

  // Heuristic: if top holders are similarly weighted and very high share, cluster risk rises.
  const top5 = top20.slice(0, 5);
  const top5Avg = top5.length ? top5.reduce((a, b) => a + b.percent, 0) / top5.length : 0;
  const variance = top5.length
    ? top5.reduce((acc, h) => acc + Math.pow(h.percent - top5Avg, 2), 0) / top5.length
    : 0;
  const suspiciousClusterScore = top10Percent > 60 && variance < 3 ? 0.75 : top10Percent > 50 ? 0.4 : 0.1;

  return {
    top20,
    totalHolders: normalized.length,
    top10Percent: Number.isFinite(top10Percent) ? top10Percent : null,
    largestHolder,
    devWalletPercent,
    suspiciousClusterScore,
  };
}

export async function fetchWalletTransactions(walletAddress: string): Promise<WalletBehaviorSnapshot> {
  const apiKey = requireHeliusApiKey();
  const url = `${HELIUS_BASE}/addresses/${walletAddress}/transactions?api-key=${apiKey}&limit=100`;
  const data = await getJsonWithCache<HeliusTx[]>(`helius:wallettx:${walletAddress}`, url, 20_000);

  const txs = data ?? [];
  const trades = txs.slice(0, 100).map((tx) => {
    const tokenTransfer = tx.tokenTransfers?.[0];
    const token = tokenTransfer?.mint ?? "SOL";
    const side: "buy" | "sell" | "unknown" = tx.type?.toLowerCase().includes("buy")
      ? "buy"
      : tx.type?.toLowerCase().includes("sell")
        ? "sell"
        : "unknown";

    const nativeAmount = (tx.nativeTransfers?.[0]?.amount ?? 0) / 1_000_000_000;
    const amountUsd = Math.abs(nativeAmount) * 150; // fallback estimate when USD not returned

    return {
      signature: tx.signature ?? "unknown",
      timestamp: tx.timestamp ?? 0,
      token,
      side,
      amountUsd,
      pnlUsd: null,
    };
  });

  const timestamps = trades.map((t) => t.timestamp).filter((t) => t > 0);
  const firstSeen = timestamps.length ? new Date(Math.min(...timestamps) * 1000).toISOString() : null;

  const avgPositionSize = trades.length
    ? trades.reduce((acc, t) => acc + t.amountUsd, 0) / trades.length
    : 0;

  const byToken = new Map<string, number>();
  for (const t of trades) {
    byToken.set(t.token, (byToken.get(t.token) ?? 0) + 1);
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const earlyBuys = trades.filter((t) => t.side === "buy" && nowSec - t.timestamp < 120);
  const earlyBuyerScore = Math.min(100, Math.round((earlyBuys.length / Math.max(trades.length, 1)) * 100));

  const gaps: number[] = [];
  for (let i = 1; i < trades.length; i += 1) {
    const gap = Math.abs(trades[i - 1]!.timestamp - trades[i]!.timestamp);
    if (gap > 0) gaps.push(gap);
  }

  const avgGapSec = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
  const tradingFrequency = avgGapSec < 300 ? "Very High" : avgGapSec < 3_600 ? "High" : avgGapSec < 86_400 ? "Medium" : "Low";

  const suspiciousPatterns: string[] = [];
  if (tradingFrequency === "Very High") suspiciousPatterns.push("High-frequency execution pattern");
  if (earlyBuyerScore > 40) suspiciousPatterns.push("Frequent ultra-early buys after launches");

  const notableWins: Array<{ token: string; pnlUsd: number }> = [];

  // Approximation from sparse public tx format: assume neutral until PnL model is improved.
  const winRate = 50;
  const avgHoldMinutes = 60;

  return {
    firstSeen,
    totalTransactions: txs.length,
    trades,
    avgHoldMinutes,
    winRate,
    avgPositionSize,
    tradingFrequency,
    earlyBuyerScore,
    suspiciousPatterns,
    notableWins,
  };
}
