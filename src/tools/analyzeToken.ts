import { fetchBagsData } from "../api/bags.js";
import { fetchDexByTokenAddress, fetchDexByTokenName } from "../api/dexscreener.js";
import { fetchTopHolders } from "../api/helius.js";
import { fetchRugCheck } from "../api/rugcheck.js";
import { classifyConcentration, formatAgeFromTimestamp, nowIso, safePct } from "../utils/formatReport.js";
import { computeRiskScore } from "../utils/riskScore.js";
import { isLikelySolanaAddress, normalizeInput, requireOneOf } from "../utils/validators.js";
import { sanitizeAxiosError } from "../utils/http.js";
import type { AnalyzeTokenResult, DataSourceStatus, HolderAnalytics, TokenContract, TokenMarket } from "../types/index.js";

interface AnalyzeTokenInput {
  token_address?: string;
  token_name?: string;
}

function toFreshness(
  sourceMeta?: { fetchedAt: string; ageMs: number; cacheStatus: "hit" | "miss" },
): DataSourceStatus["freshness"] | undefined {
  if (!sourceMeta) return undefined;

  const ageSeconds = Math.max(0, Math.round(sourceMeta.ageMs / 1000));
  const label = ageSeconds <= 30 ? "live" : ageSeconds <= 300 ? "recent" : "stale";

  return {
    fetchedAt: sourceMeta.fetchedAt,
    ageSeconds,
    label,
    cacheStatus: sourceMeta.cacheStatus,
  };
}

export async function analyzeToken(input: AnalyzeTokenInput): Promise<AnalyzeTokenResult> {
  const validation = requireOneOf({ token_address: input.token_address, token_name: input.token_name });
  if (validation) {
    throw new Error(validation);
  }

  const tokenAddressRaw = input.token_address ? normalizeInput(input.token_address) : undefined;
  const tokenNameRaw = input.token_name ? normalizeInput(input.token_name) : undefined;

  if (tokenAddressRaw && !isLikelySolanaAddress(tokenAddressRaw)) {
    throw new Error("Invalid Solana token address format");
  }

  const sources: DataSourceStatus[] = [];

  let dexErr: string | null = null;
  let rugErr: string | null = null;
  let holdersErr: string | null = null;
  let bagsErr: string | null = null;

  const dexPromise = (async () => {
    try {
      const snap = tokenAddressRaw
        ? await fetchDexByTokenAddress(tokenAddressRaw)
        : await fetchDexByTokenName(tokenNameRaw!);
      sources.push({ source: "dexscreener", status: "ok", freshness: toFreshness(snap?.sourceMeta) });
      return snap;
    } catch (error) {
      dexErr = sanitizeAxiosError(error);
      console.error(`[analyze_token] dexscreener failed: ${dexErr}`);
      sources.push({ source: "dexscreener", status: "unavailable", note: dexErr });
      return null;
    }
  })();

  const dex = await dexPromise;
  const resolvedAddress = tokenAddressRaw ?? dex?.address ?? "unknown";

  const rugPromise = (async () => {
    if (!isLikelySolanaAddress(resolvedAddress)) return null;
    try {
      const snap = await fetchRugCheck(resolvedAddress);
      sources.push({ source: "rugcheck", status: "ok", freshness: toFreshness(snap?.sourceMeta) });
      return snap;
    } catch (error) {
      rugErr = sanitizeAxiosError(error);
      console.error(`[analyze_token] rugcheck failed: ${rugErr}`);
      sources.push({ source: "rugcheck", status: "unavailable", note: rugErr });
      return null;
    }
  })();

  const holdersPromise = (async () => {
    if (!isLikelySolanaAddress(resolvedAddress)) return null;
    try {
      const snap = await fetchTopHolders(resolvedAddress);
      sources.push({ source: "helius", status: "ok", freshness: toFreshness(snap?.sourceMeta) });
      return snap;
    } catch (error) {
      holdersErr = sanitizeAxiosError(error);
      console.error(`[analyze_token] helius failed: ${holdersErr}`);
      sources.push({ source: "helius", status: "unavailable", note: holdersErr });
      return null;
    }
  })();

  const bagsPromise = (async () => {
    try {
      const snap = await fetchBagsData(resolvedAddress);
      if (snap.status === "unavailable") {
        sources.push({ source: "bags", status: "unavailable", note: snap.notes, freshness: toFreshness(snap.sourceMeta) });
      } else {
        sources.push({ source: "bags", status: "ok", note: snap.notes, freshness: toFreshness(snap.sourceMeta) });
      }
      return snap;
    } catch (error) {
      bagsErr = sanitizeAxiosError(error);
      console.error(`[analyze_token] bags failed: ${bagsErr}`);
      sources.push({ source: "bags", status: "unavailable", note: bagsErr });
      return null;
    }
  })();

  const [rug, holders, bags] = await Promise.all([rugPromise, holdersPromise, bagsPromise]);

  const market: TokenMarket = {
    price: dex?.price ?? null,
    marketCap: dex?.marketCap ?? null,
    fdv: dex?.fdv ?? null,
    volume24h: dex?.volume24h ?? null,
    liquidity: dex?.liquidity ?? null,
    priceChange24h: dex?.priceChange24h ?? null,
    dexId: dex?.dexId ?? null,
    pairCreatedAt: dex?.pairCreatedAt ?? null,
  };

  const contract: TokenContract = {
    isVerified: rug?.isVerified ?? null,
    isHoneypot: rug?.isHoneypot ?? null,
    mintAuthority: rug?.mintAuthority ?? null,
    freezeAuthority: rug?.freezeAuthority ?? null,
    rugScore: rug?.rugScore ?? null,
    lpUnlocked: rug?.lpUnlocked ?? null,
  };

  const holderData: HolderAnalytics = {
    top10Percent: holders?.top10Percent ?? null,
    largestHolder: holders?.largestHolder ?? null,
    totalHolders: holders?.totalHolders ?? null,
    concentration: classifyConcentration(holders?.top10Percent ?? null),
    devWalletPercent: holders?.devWalletPercent ?? null,
    suspiciousClusterScore: holders?.suspiciousClusterScore ?? null,
    top20: holders?.top20 ?? [],
  };

  const ageMs = market.pairCreatedAt ? Date.now() - market.pairCreatedAt : null;
  const volumeConsistencyRisk = Boolean(
    market.priceChange24h !== null &&
      Math.abs(market.priceChange24h) > 30 &&
      market.liquidity !== null &&
      market.volume24h !== null &&
      market.volume24h > market.liquidity * 4,
  );

  const availableSources = sources.filter((s) => s.status === "ok").length;
  const risk = computeRiskScore({
    holders: holderData,
    market,
    contract,
    volumeConsistencyRisk,
    tokenAgeMs: ageMs,
    availableSources,
    totalSources: 4,
  });

  if (bags && bags.communityScore !== null && bags.communityScore >= 70) {
    risk.bullishSignals.push("Strong bags ecosystem community score");
    risk.score = Math.max(0, risk.score - 3);
  }
  if (bags && bags.hasBagsPool === false) {
    risk.redFlags.push("No Bags pool found for token mint");
    risk.score = Math.min(100, risk.score + 3);
  }
  if (bags && bags.creatorClaimSharePct !== null && bags.creatorClaimSharePct > 70) {
    risk.redFlags.push(`Creator claim share is high (${bags.creatorClaimSharePct.toFixed(1)}%)`);
    risk.score = Math.min(100, risk.score + 4);
  }
  if (bags && bags.uniqueClaimers !== null && bags.uniqueClaimers > 30) {
    risk.bullishSignals.push(`Strong fee-share participation (${bags.uniqueClaimers} unique claimers)`);
  }
  if (bags && bags.feeTrend === "up") {
    risk.bullishSignals.push("Bags fee-share claim activity is trending up");
  }

  const unavailableSources = sources
    .filter((s) => s.status === "unavailable")
    .map((s) => `${s.source}${s.note ? ` (${s.note})` : ""}`);

  return {
    token: {
      name: dex?.name ?? tokenNameRaw ?? "Unknown",
      symbol: dex?.symbol ?? "UNKNOWN",
      address: resolvedAddress,
      age: formatAgeFromTimestamp(market.pairCreatedAt),
      chain: dex?.chain ?? "solana",
    },
    market: {
      price: market.price,
      marketCap: market.marketCap,
      fdv: market.fdv,
      volume24h: market.volume24h,
      liquidity: market.liquidity,
      priceChange24h: market.priceChange24h,
    },
    contract,
    holders: {
      top10Percent: safePct(holderData.top10Percent),
      largestHolder: safePct(holderData.largestHolder),
      totalHolders: holderData.totalHolders,
      concentration: holderData.concentration,
    },
    risk,
    meta: {
      fetchedAt: nowIso(),
      dataSources: sources,
      unavailableSources,
    },
  };
}

export function analyzeTokenErrorFallback(input: AnalyzeTokenInput, errorMessage: string): AnalyzeTokenResult {
  return {
    token: {
      name: input.token_name ?? "Unknown",
      symbol: "UNKNOWN",
      address: input.token_address ?? "unknown",
      age: "unknown",
      chain: "solana",
    },
    market: {
      price: null,
      marketCap: null,
      fdv: null,
      volume24h: null,
      liquidity: null,
      priceChange24h: null,
    },
    contract: {
      isVerified: null,
      isHoneypot: null,
      mintAuthority: null,
      freezeAuthority: null,
      rugScore: null,
      lpUnlocked: null,
    },
    holders: {
      top10Percent: null,
      largestHolder: null,
      totalHolders: null,
      concentration: "Unknown",
    },
    risk: {
      score: 100,
      label: "Extreme Risk",
      confidence: 0,
      bullishSignals: [],
      redFlags: [errorMessage],
    },
    meta: {
      fetchedAt: nowIso(),
      dataSources: [
        { source: "dexscreener", status: "unavailable" },
        { source: "rugcheck", status: "unavailable" },
        { source: "helius", status: "unavailable" },
        { source: "bags", status: "unavailable" },
      ],
      unavailableSources: ["all"],
    },
  };
}
