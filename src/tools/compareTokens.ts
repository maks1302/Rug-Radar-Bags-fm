import { analyzeToken } from "./analyzeToken.js";
import { isLikelySolanaAddress, normalizeInput } from "../utils/validators.js";
import type { CompareTokensResult } from "../types/index.js";

interface CompareTokensInput {
  token_a: string;
  token_b: string;
}

type CategoryWinner = CompareTokensResult["comparison"]["categoryWinners"][string];
type ComparedToken = Awaited<ReturnType<typeof analyzeToken>>;

function winnerByMetric(a: number | null, b: number | null, higherIsBetter = true): CategoryWinner {
  if (a === null && b === null) return "tie";
  if (a === null) return "tokenB";
  if (b === null) return "tokenA";
  if (a === b) return "tie";
  if (higherIsBetter) return a > b ? "tokenA" : "tokenB";
  return a < b ? "tokenA" : "tokenB";
}

function buildTrustCaveats(label: string, token: ComparedToken): string[] {
  const caveats: string[] = [];

  if (token.risk.confidence < 75) {
    caveats.push(`${label} has reduced confidence (${token.risk.confidence}/100), so its comparison data is only partially complete.`);
  }

  if (token.meta.unavailableSources.length > 0) {
    caveats.push(`${label} is missing source coverage: ${token.meta.unavailableSources.join(", ")}.`);
  }

  return caveats;
}

function buildRecommendation(
  winner: CompareTokensResult["comparison"]["winner"],
  tokenA: ComparedToken,
  tokenB: ComparedToken,
  caveats: string[],
): string {
  const base =
    winner === "tie"
      ? "No clear healthier pick. Reduce size and monitor contract + holder changes in real time."
      : `Healthier pick: ${winner === "tokenA" ? tokenA.token.symbol : tokenB.token.symbol}. Still DYOR and manage risk.`;

  if (caveats.length === 0) {
    return base;
  }

  return `${base} Re-run before acting because comparison confidence is uneven or incomplete.`;
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
  const caveats = [
    ...buildTrustCaveats(tokenA.token.symbol, tokenA),
    ...buildTrustCaveats(tokenB.token.symbol, tokenB),
  ];

  if (Math.abs(tokenA.risk.confidence - tokenB.risk.confidence) >= 25) {
    caveats.push(
      `Confidence differs materially between ${tokenA.token.symbol} (${tokenA.risk.confidence}/100) and ${tokenB.token.symbol} (${tokenB.risk.confidence}/100).`,
    );
  }

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
      confidence: tokenA.risk.confidence,
      keyMetrics: {
        liquidity: tokenA.market.liquidity,
        volume24h: tokenA.market.volume24h,
        marketCap: tokenA.market.marketCap,
        holderTop10: tokenA.holders.top10Percent,
        riskLabel: tokenA.risk.label,
      },
      meta: {
        fetchedAt: tokenA.meta.fetchedAt,
        dataSources: tokenA.meta.dataSources,
        unavailableSources: tokenA.meta.unavailableSources,
      },
    },
    tokenB: {
      symbol: tokenB.token.symbol,
      riskScore: tokenB.risk.score,
      confidence: tokenB.risk.confidence,
      keyMetrics: {
        liquidity: tokenB.market.liquidity,
        volume24h: tokenB.market.volume24h,
        marketCap: tokenB.market.marketCap,
        holderTop10: tokenB.holders.top10Percent,
        riskLabel: tokenB.risk.label,
      },
      meta: {
        fetchedAt: tokenB.meta.fetchedAt,
        dataSources: tokenB.meta.dataSources,
        unavailableSources: tokenB.meta.unavailableSources,
      },
    },
    comparison: {
      winner,
      reasoning,
      categoryWinners: categories,
      caveats,
    },
    recommendation: buildRecommendation(winner, tokenA, tokenB, caveats),
  };
}
