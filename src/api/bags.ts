export interface BagsSnapshot {
  communityScore: number | null;
  feeTrend: "up" | "down" | "flat" | "unknown";
  notes: string;
}

export async function fetchBagsData(tokenAddress: string): Promise<BagsSnapshot> {
  const apiKey = process.env.BAGS_API_KEY;
  if (!apiKey) {
    return {
      communityScore: null,
      feeTrend: "unknown",
      notes: "BAGS_API_KEY missing; bags data unavailable",
    };
  }

  // TODO: replace with official Bags endpoint once API path is confirmed from bags.fm developers docs.
  // For now we return stable mock data so tools stay deterministic and never hard-fail on this optional source.
  return {
    communityScore: 55,
    feeTrend: "flat",
    notes: `Mocked bags data for ${tokenAddress.slice(0, 4)}...${tokenAddress.slice(-4)}`,
  };
}
