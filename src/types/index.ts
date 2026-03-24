export type RiskLabel = "Low Risk" | "Medium Risk" | "High Risk" | "Extreme Risk";
export type RiskLevel = "Low" | "Medium" | "High" | "Extreme";

export interface DataSourceStatus {
  source: "dexscreener" | "rugcheck" | "helius" | "bags";
  status: "ok" | "unavailable";
  note?: string;
  freshness?: {
    fetchedAt: string;
    ageSeconds: number;
    label: "live" | "recent" | "stale";
    cacheStatus: "hit" | "miss";
  };
}

export interface TokenIdentity {
  name: string;
  symbol: string;
  address: string;
  age: string;
  chain: string;
}

export interface TokenMarket {
  price: number | null;
  marketCap: number | null;
  fdv: number | null;
  volume24h: number | null;
  liquidity: number | null;
  priceChange24h: number | null;
  dexId: string | null;
  pairCreatedAt: number | null;
}

export interface TokenContract {
  isVerified: boolean | null;
  isHoneypot: boolean | null;
  mintAuthority: boolean | null;
  freezeAuthority: boolean | null;
  rugScore: number | null;
  lpUnlocked: boolean | null;
}

export interface HolderAnalytics {
  top10Percent: number | null;
  largestHolder: number | null;
  totalHolders: number | null;
  concentration: "Low" | "Medium" | "High" | "Unknown";
  devWalletPercent: number | null;
  suspiciousClusterScore: number | null;
  top20: Array<{ wallet: string; percent: number }>;
}

export interface RiskAssessment {
  score: number;
  label: RiskLabel;
  confidence: number;
  bullishSignals: string[];
  redFlags: string[];
  redFlagDetails: Array<{
    flag: string;
    impact: string;
  }>;
}

export interface AnalyzeTokenResult {
  token: TokenIdentity;
  market: Omit<TokenMarket, "pairCreatedAt" | "dexId">;
  contract: TokenContract;
  holders: Omit<HolderAnalytics, "top20" | "devWalletPercent" | "suspiciousClusterScore">;
  risk: RiskAssessment;
  meta: {
    fetchedAt: string;
    dataSources: DataSourceStatus[];
    sectionSources: {
      market: DataSourceStatus[];
      contract: DataSourceStatus[];
      holders: DataSourceStatus[];
      community: DataSourceStatus[];
      risk: DataSourceStatus[];
    };
    unavailableSources: string[];
  };
}

export interface WalletTrade {
  signature: string;
  timestamp: number;
  token: string;
  side: "buy" | "sell" | "unknown";
  amountUsd: number;
  pnlUsd: number | null;
}

export interface AnalyzeWalletResult {
  wallet: {
    address: string;
    firstSeen: string | null;
    totalTransactions: number;
  };
  behavior: {
    walletType: "Sniper" | "Whale" | "Bot" | "Insider" | "Retail";
    avgHoldTime: string;
    winRate: number;
    avgPositionSize: number;
  };
  activity: {
    mostTradedTokens: string[];
    recentTrades: WalletTrade[];
    tradingFrequency: string;
  };
  signals: {
    earlyBuyerScore: number;
    suspiciousPatterns: string[];
    notableWins: Array<{ token: string; pnlUsd: number }>;
  };
  summary: {
    oneLineSummary: string;
    riskToTradeWith: "Low" | "Medium" | "High";
  };
}

export interface ScanRiskResult {
  token: { address: string; symbol: string };
  riskLevel: RiskLevel;
  score: number;
  flagsTriggered: Array<{ flag: string; severity: "Low" | "Medium" | "High" | "Extreme"; detail: string }>;
  flagsPassed: Array<{ flag: string; detail: string }>;
  verdict: string;
  meta: {
    fetchedAt: string;
    dataSources: DataSourceStatus[];
  };
}

export interface CompareTokensResult {
  tokenA: { symbol: string; riskScore: number; keyMetrics: Record<string, number | string | null> };
  tokenB: { symbol: string; riskScore: number; keyMetrics: Record<string, number | string | null> };
  comparison: {
    winner: "tokenA" | "tokenB" | "tie";
    reasoning: string;
    categoryWinners: Record<string, "tokenA" | "tokenB" | "tie">;
  };
  recommendation: string;
}

export interface ToolContext {
  toolName: string;
}
