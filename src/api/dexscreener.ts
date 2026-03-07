import { getJsonWithCache } from "../utils/http.js";

interface DexPair {
  chainId?: string;
  dexId?: string;
  pairAddress?: string;
  baseToken?: { address?: string; name?: string; symbol?: string };
  quoteToken?: { symbol?: string };
  priceUsd?: string;
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  liquidity?: { usd?: number };
  volume?: { h24?: number };
  priceChange?: { h24?: number };
}

interface DexResponse {
  pairs?: DexPair[];
}

function pickBestPair(pairs: DexPair[]): DexPair | null {
  if (pairs.length === 0) return null;
  return [...pairs].sort((a, b) => {
    const liqA = a.liquidity?.usd ?? 0;
    const liqB = b.liquidity?.usd ?? 0;
    return liqB - liqA;
  })[0] ?? null;
}

export interface DexTokenSnapshot {
  address: string;
  name: string;
  symbol: string;
  chain: string;
  dexId: string | null;
  price: number | null;
  fdv: number | null;
  marketCap: number | null;
  pairCreatedAt: number | null;
  liquidity: number | null;
  volume24h: number | null;
  priceChange24h: number | null;
}

export async function fetchDexByTokenAddress(address: string): Promise<DexTokenSnapshot | null> {
  const url = `https://api.dexscreener.com/latest/dex/tokens/${address}`;
  const data = await getJsonWithCache<DexResponse>(`dex:token:${address}`, url);
  const pair = pickBestPair(data.pairs ?? []);
  if (!pair) return null;

  return {
    address: pair.baseToken?.address ?? address,
    name: pair.baseToken?.name ?? "Unknown",
    symbol: pair.baseToken?.symbol ?? "UNKNOWN",
    chain: pair.chainId ?? "solana",
    dexId: pair.dexId ?? null,
    price: pair.priceUsd ? Number(pair.priceUsd) : null,
    fdv: pair.fdv ?? null,
    marketCap: pair.marketCap ?? null,
    pairCreatedAt: pair.pairCreatedAt ?? null,
    liquidity: pair.liquidity?.usd ?? null,
    volume24h: pair.volume?.h24 ?? null,
    priceChange24h: pair.priceChange?.h24 ?? null,
  };
}

export async function fetchDexByTokenName(tokenName: string): Promise<DexTokenSnapshot | null> {
  const encoded = encodeURIComponent(tokenName);
  const url = `https://api.dexscreener.com/latest/dex/search?q=${encoded}`;
  const data = await getJsonWithCache<DexResponse>(`dex:search:${tokenName.toLowerCase()}`, url);
  const solanaPairs = (data.pairs ?? []).filter((p) => p.chainId === "solana");
  const pair = pickBestPair(solanaPairs);
  if (!pair) return null;

  return {
    address: pair.baseToken?.address ?? "",
    name: pair.baseToken?.name ?? tokenName,
    symbol: pair.baseToken?.symbol ?? "UNKNOWN",
    chain: pair.chainId ?? "solana",
    dexId: pair.dexId ?? null,
    price: pair.priceUsd ? Number(pair.priceUsd) : null,
    fdv: pair.fdv ?? null,
    marketCap: pair.marketCap ?? null,
    pairCreatedAt: pair.pairCreatedAt ?? null,
    liquidity: pair.liquidity?.usd ?? null,
    volume24h: pair.volume?.h24 ?? null,
    priceChange24h: pair.priceChange?.h24 ?? null,
  };
}
