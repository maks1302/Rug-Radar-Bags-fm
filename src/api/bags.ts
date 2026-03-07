import { getJsonWithCache, sanitizeAxiosError } from "../utils/http.js";

const BAGS_BASE_URL = "https://public-api-v2.bags.fm/api/v1";

interface BagsEnvelope<T> {
  success: boolean;
  response: T;
  error?: string;
}

interface BagsCreator {
  wallet?: string;
  provider?: string;
  providerUsername?: string;
  isCreator?: boolean;
}

interface BagsClaimStat {
  wallet?: string;
  isCreator?: boolean;
  totalClaimed?: string;
}

interface BagsClaimEvent {
  wallet?: string;
  isCreator?: boolean;
  amount?: string;
  signature?: string;
  timestamp?: string;
}

interface BagsClaimEventsResponse {
  events?: BagsClaimEvent[];
}

interface BagsPoolResponse {
  tokenMint?: string;
  dbcConfigKey?: string;
  dbcPoolKey?: string;
  dammV2PoolKey?: string;
}

export interface BagsSnapshot {
  status: "ok" | "unavailable";
  communityScore: number | null;
  feeTrend: "up" | "down" | "flat" | "unknown";
  creatorWallet: string | null;
  creatorProvider: string | null;
  lifetimeFeesLamports: number | null;
  uniqueClaimers: number | null;
  creatorClaimSharePct: number | null;
  recentClaims24h: number | null;
  hasBagsPool: boolean | null;
  notes: string;
}

function toLamports(value: string | undefined): number {
  if (!value) return 0;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export async function fetchBagsData(tokenAddress: string): Promise<BagsSnapshot> {
  const apiKey = process.env.BAGS_API_KEY;
  if (!apiKey) {
    return {
      status: "unavailable",
      communityScore: null,
      feeTrend: "unknown",
      creatorWallet: null,
      creatorProvider: null,
      lifetimeFeesLamports: null,
      uniqueClaimers: null,
      creatorClaimSharePct: null,
      recentClaims24h: null,
      hasBagsPool: null,
      notes: "BAGS_API_KEY missing; bags data unavailable",
    };
  }

  const headers = { "x-api-key": apiKey };
  const creatorsUrl = `${BAGS_BASE_URL}/token-launch/creator/v3?tokenMint=${encodeURIComponent(tokenAddress)}`;
  const lifetimeFeesUrl = `${BAGS_BASE_URL}/token-launch/lifetime-fees?tokenMint=${encodeURIComponent(tokenAddress)}`;
  const claimStatsUrl = `${BAGS_BASE_URL}/token-launch/claim-stats?tokenMint=${encodeURIComponent(tokenAddress)}`;
  const claimEventsUrl = `${BAGS_BASE_URL}/fee-share/token/claim-events?tokenMint=${encodeURIComponent(tokenAddress)}&mode=offset&limit=100&offset=0`;
  const poolUrl = `${BAGS_BASE_URL}/solana/bags/pools/token-mint?tokenMint=${encodeURIComponent(tokenAddress)}`;

  const [creatorsRes, feesRes, claimStatsRes, claimEventsRes, poolRes] = await Promise.allSettled([
    getJsonWithCache<BagsEnvelope<BagsCreator[]>>(`bags:creators:${tokenAddress}`, creatorsUrl, 60_000, headers),
    getJsonWithCache<BagsEnvelope<string>>(`bags:lifetimefees:${tokenAddress}`, lifetimeFeesUrl, 60_000, headers),
    getJsonWithCache<BagsEnvelope<BagsClaimStat[]>>(`bags:claimstats:${tokenAddress}`, claimStatsUrl, 60_000, headers),
    getJsonWithCache<BagsEnvelope<BagsClaimEventsResponse>>(`bags:claimevents:${tokenAddress}`, claimEventsUrl, 20_000, headers),
    getJsonWithCache<BagsEnvelope<BagsPoolResponse>>(`bags:pool:${tokenAddress}`, poolUrl, 60_000, headers),
  ]);

  const errors: string[] = [];
  const pull = <T>(result: PromiseSettledResult<T>, name: string): T | null => {
    if (result.status === "fulfilled") return result.value;
    const err = sanitizeAxiosError(result.reason);
    errors.push(`${name}: ${err}`);
    return null;
  };

  const creatorsData = pull(creatorsRes, "creators");
  const feesData = pull(feesRes, "lifetime-fees");
  const claimStatsData = pull(claimStatsRes, "claim-stats");
  const claimEventsData = pull(claimEventsRes, "claim-events");
  const poolData = pull(poolRes, "pool");

  const creators = creatorsData?.response ?? [];
  const creator = creators.find((c) => c.isCreator) ?? creators[0];

  const lifetimeFeesLamports = feesData?.response ? toLamports(feesData.response) : null;

  const claimStats = claimStatsData?.response ?? [];
  const uniqueClaimers = claimStats.length || null;
  const totalClaimedLamports = claimStats.reduce((acc, c) => acc + toLamports(c.totalClaimed), 0);
  const creatorClaimedLamports = claimStats
    .filter((c) => c.isCreator)
    .reduce((acc, c) => acc + toLamports(c.totalClaimed), 0);
  const creatorClaimSharePct =
    totalClaimedLamports > 0 ? Number(((creatorClaimedLamports / totalClaimedLamports) * 100).toFixed(2)) : null;

  const claimEvents = claimEventsData?.response?.events ?? [];
  const nowMs = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const twoDayMs = 2 * oneDayMs;
  const recentClaims24h = claimEvents.filter((e) => {
    const ts = Date.parse(e.timestamp ?? "");
    return Number.isFinite(ts) && nowMs - ts <= oneDayMs;
  }).length;
  const previousClaims24h = claimEvents.filter((e) => {
    const ts = Date.parse(e.timestamp ?? "");
    return Number.isFinite(ts) && nowMs - ts > oneDayMs && nowMs - ts <= twoDayMs;
  }).length;

  let feeTrend: BagsSnapshot["feeTrend"] = "unknown";
  if (claimEvents.length > 0) {
    if (recentClaims24h > previousClaims24h) feeTrend = "up";
    else if (recentClaims24h < previousClaims24h) feeTrend = "down";
    else feeTrend = "flat";
  }

  const hasBagsPool = Boolean(poolData?.response?.dbcPoolKey || poolData?.response?.dammV2PoolKey);

  // Community score combines adoption (claimers/events), monetization (fees), and creator concentration.
  const feeScore =
    lifetimeFeesLamports === null
      ? 0
      : lifetimeFeesLamports > 10_000_000_000
        ? 40
        : lifetimeFeesLamports > 1_000_000_000
          ? 30
          : lifetimeFeesLamports > 100_000_000
            ? 20
            : 10;
  const claimerScore = uniqueClaimers === null ? 0 : uniqueClaimers > 100 ? 30 : uniqueClaimers > 20 ? 20 : uniqueClaimers > 5 ? 10 : 5;
  const concentrationPenalty = creatorClaimSharePct === null ? 0 : creatorClaimSharePct > 80 ? 20 : creatorClaimSharePct > 60 ? 10 : 0;
  const poolBonus = hasBagsPool ? 10 : 0;
  const activityBonus = recentClaims24h > 5 ? 10 : recentClaims24h > 0 ? 5 : 0;
  const computedScore = Math.max(0, Math.min(100, feeScore + claimerScore + poolBonus + activityBonus - concentrationPenalty));

  if (errors.length > 0) {
    console.error(`[bags] Partial fetch failure for ${tokenAddress}: ${errors.join(" | ")}`);
  }

  return {
    status: errors.length === 5 ? "unavailable" : "ok",
    communityScore: errors.length === 5 ? null : computedScore,
    feeTrend,
    creatorWallet: creator?.wallet ?? null,
    creatorProvider: creator?.provider ?? null,
    lifetimeFeesLamports,
    uniqueClaimers,
    creatorClaimSharePct,
    recentClaims24h,
    hasBagsPool: errors.length === 5 ? null : hasBagsPool,
    notes: errors.length > 0 ? `Partial data: ${errors.join("; ")}` : "Bags data loaded",
  };
}
