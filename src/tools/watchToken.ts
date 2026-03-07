import { analyzeToken } from "./analyzeToken.js";
import { insertSnapshot, insertToolEvent, normalizeThresholds, upsertWatchlist, type WatchThresholds } from "../db/repository.js";
import { isLikelySolanaAddress, normalizeInput } from "../utils/validators.js";

interface WatchTokenInput {
  token_address: string;
  user_id?: string;
  liquidity_drop_percent?: number;
  risk_score_increase?: number;
  holder_concentration_increase?: number;
  alert_on_authority_change?: boolean;
  alert_on_honeypot?: boolean;
}

export interface WatchTokenResult {
  watch: {
    id: number;
    userId: string;
    tokenAddress: string;
    active: boolean;
    thresholds: WatchThresholds;
  };
  baselineSnapshot: {
    riskScore: number;
    liquidity: number | null;
    top10Percent: number | null;
    fetchedAt: string;
  };
  note: string;
}

export async function watchToken(input: WatchTokenInput): Promise<WatchTokenResult> {
  const tokenAddress = normalizeInput(input.token_address);
  if (!isLikelySolanaAddress(tokenAddress)) {
    throw new Error("Invalid Solana token address format");
  }

  const userId = normalizeInput(input.user_id ?? "anonymous");
  const thresholds = normalizeThresholds({
    liquidityDropPercent: input.liquidity_drop_percent,
    riskScoreIncrease: input.risk_score_increase,
    holderConcentrationIncrease: input.holder_concentration_increase,
    alertOnAuthorityChange: input.alert_on_authority_change,
    alertOnHoneypot: input.alert_on_honeypot,
  });

  const [watch, analysis] = await Promise.all([
    upsertWatchlist({ userId, tokenAddress, rules: thresholds }),
    analyzeToken({ token_address: tokenAddress }),
  ]);

  await Promise.all([
    insertSnapshot({
      tokenAddress,
      snapshot: analysis as unknown as Record<string, unknown>,
      riskScore: analysis.risk.score,
      liquidity: analysis.market.liquidity,
      top10Pct: analysis.holders.top10Percent,
    }),
    insertToolEvent({
      toolName: "watch_token",
      userId,
      tokenAddress,
      meta: { thresholds },
    }),
  ]);

  return {
    watch: {
      id: watch.id,
      userId: watch.userId,
      tokenAddress: watch.tokenAddress,
      active: watch.active,
      thresholds,
    },
    baselineSnapshot: {
      riskScore: analysis.risk.score,
      liquidity: analysis.market.liquidity,
      top10Percent: analysis.holders.top10Percent,
      fetchedAt: analysis.meta.fetchedAt,
    },
    note: "Watchlist saved. Use get_token_changes to evaluate deltas and trigger alerts.",
  };
}
