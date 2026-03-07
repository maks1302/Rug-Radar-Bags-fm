import { analyzeToken } from "./analyzeToken.js";
import { isLikelySolanaAddress, normalizeInput } from "../utils/validators.js";
import type { CompareTokensResult } from "../types/index.js";

interface CompareTokensInput {
  token_a: string;
  token_b: string;
}

function winnerByMetric(a: number | null, b: number | null, higherIsBetter = true): "tokenA" | "tokenB" | "tie" {
  if (a === null && b === null) return "tie";
  if (a === null) return "tokenB";
  if (b === null) return "tokenA";
  if (a === b) return "tie";
  if (higherIsBetter) return a > b ? "tokenA" : "tokenB";
  return a < b ? "tokenA" : "tokenB";
}

export async function compareTokens(input: CompareTokensInput): Promise<CompareTokensResult> {
  const tokenAInput = normalizeInput(input.token_a);
  const tokenBInput = normalizeInput(input.token_b);

  const [tokenA, tokenB] = await Promise.all([
    analyzeToken({ [isLikelySolanaAddress(tokenAInput) ? "token_address" : "token_name"]: tokenAInput }),
    analyzeToken({ [isLikelySolanaAddress(tokenBInput) ? "token_address" : "token_name"]: tokenBInput }),
  ]);

  const categories: Record<string, "tokenA" | "tokenB" | "tie"> = {
    riskScore: winnerByMetric(tokenA.risk.score, tokenB.risk.score, false),
    holderConcentration: winnerByMetric(tokenA.holders.top10Percent, tokenB.holders.top10Percent, false),
    liquidity: winnerByMetric(tokenA.market.liquidity, tokenB.market.liquidity, true),
    volume: winnerByMetric(tokenA.market.volume24h, tokenB.market.volume24h, true),
    marketCap: winnerByMetric(tokenA.market.marketCap, tokenB.market.marketCap, true),
    contractSafety: winnerByMetric(tokenA.contract.rugScore, tokenB.contract.rugScore, false),
    tokenAge: winnerByMetric(
      tokenA.token.age.endsWith("d") ? Number(tokenA.token.age.replace("d", "")) : 0,
      tokenB.token.age.endsWith("d") ? Number(tokenB.token.age.replace("d", "")) : 0,
      true,
    ),
  };

  const scoreA = Object.values(categories).filter((v) => v === "tokenA").length;
  const scoreB = Object.values(categories).filter((v) => v === "tokenB").length;

  const winner: "tokenA" | "tokenB" | "tie" = scoreA === scoreB ? "tie" : scoreA > scoreB ? "tokenA" : "tokenB";

  const reasoning =
    winner === "tie"
      ? "Both tokens show mixed strength across key risk and liquidity metrics."
      : winner === "tokenA"
        ? `${tokenA.token.symbol} wins more categories (${scoreA} vs ${scoreB}), especially on risk-adjusted quality.`
        : `${tokenB.token.symbol} wins more categories (${scoreB} vs ${scoreA}), especially on risk-adjusted quality.`;

  return {
    tokenA: {
      symbol: tokenA.token.symbol,
      riskScore: tokenA.risk.score,
      keyMetrics: {
        liquidity: tokenA.market.liquidity,
        volume24h: tokenA.market.volume24h,
        marketCap: tokenA.market.marketCap,
        holderTop10: tokenA.holders.top10Percent,
        riskLabel: tokenA.risk.label,
      },
    },
    tokenB: {
      symbol: tokenB.token.symbol,
      riskScore: tokenB.risk.score,
      keyMetrics: {
        liquidity: tokenB.market.liquidity,
        volume24h: tokenB.market.volume24h,
        marketCap: tokenB.market.marketCap,
        holderTop10: tokenB.holders.top10Percent,
        riskLabel: tokenB.risk.label,
      },
    },
    comparison: {
      winner,
      reasoning,
      categoryWinners: categories,
    },
    recommendation:
      winner === "tie"
        ? "No clear healthier pick. Reduce size and monitor contract + holder changes in real time."
        : `Healthier pick: ${winner === "tokenA" ? tokenA.token.symbol : tokenB.token.symbol}. Still DYOR and manage risk.`,
  };
}
