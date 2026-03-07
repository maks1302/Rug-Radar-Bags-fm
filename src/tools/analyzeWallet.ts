import { fetchWalletTransactions } from "../api/helius.js";
import { nowIso } from "../utils/formatReport.js";
import { sanitizeAxiosError } from "../utils/http.js";
import { isLikelySolanaAddress, normalizeInput } from "../utils/validators.js";
import type { AnalyzeWalletResult } from "../types/index.js";

interface AnalyzeWalletInput {
  wallet_address: string;
}

function walletTypeFromHeuristics(input: {
  earlyBuyerScore: number;
  tradingFrequency: string;
  avgPositionSize: number;
  suspiciousPatterns: string[];
}): AnalyzeWalletResult["behavior"]["walletType"] {
  if (input.tradingFrequency === "Very High" && input.suspiciousPatterns.length > 0) return "Bot";
  if (input.avgPositionSize > 50_000) return "Whale";
  if (input.earlyBuyerScore > 60) return "Sniper";
  if (input.earlyBuyerScore > 35 && input.avgPositionSize > 10_000) return "Insider";
  return "Retail";
}

export async function analyzeWallet(input: AnalyzeWalletInput): Promise<AnalyzeWalletResult> {
  const walletAddress = normalizeInput(input.wallet_address);
  if (!isLikelySolanaAddress(walletAddress)) {
    throw new Error("Invalid Solana wallet address format");
  }

  try {
    const wallet = await fetchWalletTransactions(walletAddress);
    const mostTradedTokens = Object.entries(
      wallet.trades.reduce<Record<string, number>>((acc, trade) => {
        acc[trade.token] = (acc[trade.token] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([token]) => token);

    const walletType = walletTypeFromHeuristics({
      earlyBuyerScore: wallet.earlyBuyerScore,
      tradingFrequency: wallet.tradingFrequency,
      avgPositionSize: wallet.avgPositionSize,
      suspiciousPatterns: wallet.suspiciousPatterns,
    });

    const holdHours = wallet.avgHoldMinutes / 60;
    const riskToTradeWith: AnalyzeWalletResult["summary"]["riskToTradeWith"] =
      walletType === "Bot" || walletType === "Insider"
        ? "High"
        : walletType === "Whale" || walletType === "Sniper"
          ? "Medium"
          : "Low";

    return {
      wallet: {
        address: walletAddress,
        firstSeen: wallet.firstSeen,
        totalTransactions: wallet.totalTransactions,
      },
      behavior: {
        walletType,
        avgHoldTime: holdHours < 1 ? `${wallet.avgHoldMinutes.toFixed(0)}m` : `${holdHours.toFixed(1)}h`,
        winRate: Number(wallet.winRate.toFixed(2)),
        avgPositionSize: Number(wallet.avgPositionSize.toFixed(2)),
      },
      activity: {
        mostTradedTokens,
        recentTrades: wallet.trades.slice(0, 15),
        tradingFrequency: wallet.tradingFrequency,
      },
      signals: {
        earlyBuyerScore: wallet.earlyBuyerScore,
        suspiciousPatterns: wallet.suspiciousPatterns,
        notableWins: wallet.notableWins,
      },
      summary: {
        oneLineSummary: `${walletType} profile with ${wallet.tradingFrequency.toLowerCase()} activity and ${wallet.winRate.toFixed(0)}% estimated win rate.`,
        riskToTradeWith,
      },
    };
  } catch (error) {
    const reason = sanitizeAxiosError(error);
    console.error(`[analyze_wallet] helius failed: ${reason}`);

    return {
      wallet: {
        address: walletAddress,
        firstSeen: null,
        totalTransactions: 0,
      },
      behavior: {
        walletType: "Retail",
        avgHoldTime: "unknown",
        winRate: 0,
        avgPositionSize: 0,
      },
      activity: {
        mostTradedTokens: [],
        recentTrades: [],
        tradingFrequency: "unknown",
      },
      signals: {
        earlyBuyerScore: 0,
        suspiciousPatterns: [`Data unavailable: ${reason}`],
        notableWins: [],
      },
      summary: {
        oneLineSummary: `Incomplete analysis at ${nowIso()} due to API failure.`,
        riskToTradeWith: "High",
      },
    };
  }
}
