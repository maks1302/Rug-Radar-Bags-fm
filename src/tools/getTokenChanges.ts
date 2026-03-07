import { analyzeToken } from "./analyzeToken.js";
import {
  getLatestSnapshot,
  insertAlert,
  insertSnapshot,
  insertToolEvent,
  listActiveWatchlists,
  type WatchlistRecord,
} from "../db/repository.js";
import { shouldEmitAlert } from "../db/redis.js";
import { isLikelySolanaAddress, normalizeInput } from "../utils/validators.js";

interface GetTokenChangesInput {
  token_address: string;
  user_id?: string;
}

interface ChangeItem {
  metric: string;
  from: number | string | boolean | null;
  to: number | string | boolean | null;
  delta: number | null;
  direction: "up" | "down" | "flat" | "changed";
}

interface TriggeredAlert {
  watchlistId: number;
  userId: string;
  trigger: string;
  detail: string;
}

interface AnalyzeTokenLike {
  token?: { symbol?: string };
  risk?: { score?: number };
  market?: { liquidity?: number | null };
  holders?: { top10Percent?: number | null };
  contract?: {
    mintAuthority?: boolean | null;
    freezeAuthority?: boolean | null;
    isHoneypot?: boolean | null;
  };
}

function numberDelta(previous: number | null, current: number | null): number | null {
  if (previous === null || current === null) return null;
  return Number((current - previous).toFixed(2));
}

function pctDrop(previous: number | null, current: number | null): number | null {
  if (previous === null || current === null || previous === 0) return null;
  return Number((((previous - current) / previous) * 100).toFixed(2));
}

function extractChangeSet(previous: AnalyzeTokenLike | null, current: AnalyzeTokenLike): ChangeItem[] {
  if (!previous) return [];

  const prevRisk = previous.risk?.score ?? null;
  const currRisk = current.risk?.score ?? null;
  const prevLiq = previous.market?.liquidity ?? null;
  const currLiq = current.market?.liquidity ?? null;
  const prevTop10 = previous.holders?.top10Percent ?? null;
  const currTop10 = current.holders?.top10Percent ?? null;

  const mintChanged = previous.contract?.mintAuthority !== current.contract?.mintAuthority;
  const freezeChanged = previous.contract?.freezeAuthority !== current.contract?.freezeAuthority;
  const honeypotChanged = previous.contract?.isHoneypot !== current.contract?.isHoneypot;

  const changes: ChangeItem[] = [
    {
      metric: "riskScore",
      from: prevRisk,
      to: currRisk,
      delta: numberDelta(prevRisk, currRisk),
      direction: (numberDelta(prevRisk, currRisk) ?? 0) > 0 ? "up" : (numberDelta(prevRisk, currRisk) ?? 0) < 0 ? "down" : "flat",
    },
    {
      metric: "liquidity",
      from: prevLiq,
      to: currLiq,
      delta: numberDelta(prevLiq, currLiq),
      direction: (numberDelta(prevLiq, currLiq) ?? 0) > 0 ? "up" : (numberDelta(prevLiq, currLiq) ?? 0) < 0 ? "down" : "flat",
    },
    {
      metric: "top10HoldersPercent",
      from: prevTop10,
      to: currTop10,
      delta: numberDelta(prevTop10, currTop10),
      direction:
        (numberDelta(prevTop10, currTop10) ?? 0) > 0 ? "up" : (numberDelta(prevTop10, currTop10) ?? 0) < 0 ? "down" : "flat",
    },
  ];

  if (mintChanged) {
    changes.push({
      metric: "mintAuthority",
      from: previous.contract?.mintAuthority ?? null,
      to: current.contract?.mintAuthority ?? null,
      delta: null,
      direction: "changed",
    });
  }
  if (freezeChanged) {
    changes.push({
      metric: "freezeAuthority",
      from: previous.contract?.freezeAuthority ?? null,
      to: current.contract?.freezeAuthority ?? null,
      delta: null,
      direction: "changed",
    });
  }
  if (honeypotChanged) {
    changes.push({
      metric: "honeypotStatus",
      from: previous.contract?.isHoneypot ?? null,
      to: current.contract?.isHoneypot ?? null,
      delta: null,
      direction: "changed",
    });
  }

  return changes;
}

async function evaluateAlerts(
  watchlists: WatchlistRecord[],
  previous: AnalyzeTokenLike | null,
  current: AnalyzeTokenLike,
  tokenAddress: string,
): Promise<TriggeredAlert[]> {
  if (!previous) return [];

  const alerts: TriggeredAlert[] = [];

  const prevRisk = previous.risk?.score ?? null;
  const currRisk = current.risk?.score ?? null;
  const prevLiq = previous.market?.liquidity ?? null;
  const currLiq = current.market?.liquidity ?? null;
  const prevTop10 = previous.holders?.top10Percent ?? null;
  const currTop10 = current.holders?.top10Percent ?? null;

  for (const watch of watchlists) {
    const t = watch.rulesJson;
    const riskRise = prevRisk !== null && currRisk !== null ? currRisk - prevRisk : null;
    const liqDropPct = pctDrop(prevLiq, currLiq);
    const top10Rise = prevTop10 !== null && currTop10 !== null ? currTop10 - prevTop10 : null;

    const conditions: Array<{ trigger: string; hit: boolean; detail: string }> = [
      {
        trigger: "risk_score_increase",
        hit: riskRise !== null && riskRise >= t.riskScoreIncrease,
        detail: `Risk score rose by ${riskRise?.toFixed(2) ?? "n/a"} points`,
      },
      {
        trigger: "liquidity_drop",
        hit: liqDropPct !== null && liqDropPct >= t.liquidityDropPercent,
        detail: `Liquidity dropped ${liqDropPct?.toFixed(2) ?? "n/a"}%`,
      },
      {
        trigger: "holder_concentration_increase",
        hit: top10Rise !== null && top10Rise >= t.holderConcentrationIncrease,
        detail: `Top10 concentration rose by ${top10Rise?.toFixed(2) ?? "n/a"}%`,
      },
      {
        trigger: "authority_change",
        hit:
          Boolean(t.alertOnAuthorityChange) &&
          (previous.contract?.mintAuthority !== current.contract?.mintAuthority ||
            previous.contract?.freezeAuthority !== current.contract?.freezeAuthority),
        detail: "Mint/freeze authority status changed",
      },
      {
        trigger: "honeypot_detected",
        hit:
          Boolean(t.alertOnHoneypot) &&
          previous.contract?.isHoneypot !== true &&
          current.contract?.isHoneypot === true,
        detail: "Honeypot status changed to true",
      },
    ];

    for (const c of conditions) {
      if (!c.hit) continue;

      const bucket = Math.floor(Date.now() / (10 * 60 * 1000));
      const dedupeKey = `${watch.id}:${c.trigger}:${bucket}`;
      const redisKey = `alert:dedupe:${dedupeKey}`;
      const shouldEmit = await shouldEmitAlert(redisKey, Number(process.env.ALERT_DEDUPE_TTL_SECONDS ?? 600));
      if (!shouldEmit) continue;

      await insertAlert({
        watchlistId: watch.id,
        tokenAddress,
        triggerType: c.trigger,
        triggerDetail: c.detail,
        dedupeKey,
      });

      alerts.push({
        watchlistId: watch.id,
        userId: watch.userId,
        trigger: c.trigger,
        detail: c.detail,
      });
    }
  }

  return alerts;
}

export async function getTokenChanges(input: GetTokenChangesInput) {
  const tokenAddress = normalizeInput(input.token_address);
  if (!isLikelySolanaAddress(tokenAddress)) {
    throw new Error("Invalid Solana token address format");
  }

  const userId = normalizeInput(input.user_id ?? "anonymous");

  const [previousSnapshot, current] = await Promise.all([
    getLatestSnapshot(tokenAddress),
    analyzeToken({ token_address: tokenAddress }),
  ]);

  const previous = (previousSnapshot?.snapshotJson as AnalyzeTokenLike | undefined) ?? null;

  const [savedSnapshot, watchlists] = await Promise.all([
    insertSnapshot({
      tokenAddress,
      snapshot: current as unknown as Record<string, unknown>,
      riskScore: current.risk.score,
      liquidity: current.market.liquidity,
      top10Pct: current.holders.top10Percent,
    }),
    listActiveWatchlists(tokenAddress, input.user_id ? userId : undefined),
  ]);

  const [changes, alerts] = await Promise.all([
    Promise.resolve(extractChangeSet(previous, current as unknown as AnalyzeTokenLike)),
    evaluateAlerts(watchlists, previous, current as unknown as AnalyzeTokenLike, tokenAddress),
  ]);

  await insertToolEvent({
    toolName: "get_token_changes",
    userId,
    tokenAddress,
    meta: {
      hadPreviousSnapshot: Boolean(previousSnapshot),
      changes: changes.length,
      alerts: alerts.length,
      watchedBy: watchlists.length,
    },
  });

  return {
    token: {
      address: tokenAddress,
      symbol: current.token.symbol,
    },
    current: {
      riskScore: current.risk.score,
      liquidity: current.market.liquidity,
      top10Percent: current.holders.top10Percent,
      contract: {
        mintAuthority: current.contract.mintAuthority,
        freezeAuthority: current.contract.freezeAuthority,
        isHoneypot: current.contract.isHoneypot,
      },
      fetchedAt: savedSnapshot.fetchedAt,
    },
    previous: previous
      ? {
          riskScore: previous.risk?.score ?? null,
          liquidity: previous.market?.liquidity ?? null,
          top10Percent: previous.holders?.top10Percent ?? null,
          contract: {
            mintAuthority: previous.contract?.mintAuthority ?? null,
            freezeAuthority: previous.contract?.freezeAuthority ?? null,
            isHoneypot: previous.contract?.isHoneypot ?? null,
          },
          fetchedAt: previousSnapshot?.fetchedAt ?? null,
        }
      : null,
    changes,
    alertsTriggered: alerts,
    meta: {
      watchedBy: watchlists.length,
      note: previous ? "Delta computed against previous snapshot" : "First snapshot stored; no prior baseline",
    },
  };
}
