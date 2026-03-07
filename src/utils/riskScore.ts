import type { HolderAnalytics, RiskAssessment, RiskLabel, TokenContract, TokenMarket } from "../types/index.js";

interface RiskInput {
  holders: HolderAnalytics;
  market: TokenMarket;
  contract: TokenContract;
  volumeConsistencyRisk: boolean;
  tokenAgeMs: number | null;
  availableSources: number;
  totalSources: number;
}

function labelFromScore(score: number): RiskLabel {
  if (score <= 25) return "Low Risk";
  if (score <= 50) return "Medium Risk";
  if (score <= 75) return "High Risk";
  return "Extreme Risk";
}

export function computeRiskScore(input: RiskInput): RiskAssessment {
  let score = 0;
  const bullishSignals: string[] = [];
  const redFlags: string[] = [];

  const top10 = input.holders.top10Percent;
  if (top10 !== null) {
    if (top10 > 80) {
      score += 35;
      redFlags.push(`Top 10 holders control ${top10.toFixed(1)}% of supply`);
    } else if (top10 > 60) {
      score += 25;
      redFlags.push(`Top 10 holders concentration is high at ${top10.toFixed(1)}%`);
    } else if (top10 > 40) {
      score += 15;
      redFlags.push(`Top 10 holders concentration is moderate at ${top10.toFixed(1)}%`);
    } else {
      bullishSignals.push(`Top 10 holder concentration is healthier at ${top10.toFixed(1)}%`);
    }
  } else {
    redFlags.push("Holder concentration unavailable");
  }

  const liq = input.market.liquidity;
  if (liq !== null) {
    if (liq < 10_000) {
      score += 25;
      redFlags.push(`Liquidity is very thin ($${Math.round(liq).toLocaleString()})`);
    } else if (liq < 50_000) {
      score += 18;
      redFlags.push(`Liquidity is low ($${Math.round(liq).toLocaleString()})`);
    } else if (liq < 200_000) {
      score += 10;
      redFlags.push(`Liquidity is moderate ($${Math.round(liq).toLocaleString()})`);
    } else {
      bullishSignals.push(`Liquidity depth is strong ($${Math.round(liq).toLocaleString()})`);
    }
  } else {
    redFlags.push("Liquidity data unavailable");
  }

  if (input.contract.isHoneypot) {
    score += 25;
    redFlags.push("Honeypot behavior detected");
  } else if (input.contract.isHoneypot === false) {
    bullishSignals.push("No honeypot behavior detected");
  }

  if (input.contract.mintAuthority) {
    score += 10;
    redFlags.push("Mint authority still active");
  } else if (input.contract.mintAuthority === false) {
    bullishSignals.push("Mint authority appears renounced");
  }

  if (input.contract.freezeAuthority) {
    score += 8;
    redFlags.push("Freeze authority still active");
  } else if (input.contract.freezeAuthority === false) {
    bullishSignals.push("Freeze authority appears disabled");
  }

  if (input.contract.isVerified === false) {
    score += 5;
    redFlags.push("Contract is not verified");
  } else if (input.contract.isVerified === true) {
    bullishSignals.push("Contract verified");
  }

  if (input.tokenAgeMs !== null) {
    const dayMs = 24 * 60 * 60 * 1000;
    if (input.tokenAgeMs < dayMs) {
      score += 10;
      redFlags.push("Token is less than 24 hours old");
    } else if (input.tokenAgeMs < 7 * dayMs) {
      score += 7;
      redFlags.push("Token is less than 7 days old");
    } else if (input.tokenAgeMs < 30 * dayMs) {
      score += 3;
      redFlags.push("Token is relatively new (<30 days)");
    } else {
      bullishSignals.push("Token has survived beyond 30 days");
    }
  }

  if (input.volumeConsistencyRisk) {
    score += 5;
    redFlags.push("Volume pattern suggests a short-lived spike");
  } else {
    bullishSignals.push("Volume trend appears organic");
  }

  if (input.holders.devWalletPercent !== null && input.holders.devWalletPercent > 10) {
    const bump = Math.min(8, Math.round(input.holders.devWalletPercent / 2));
    score += bump;
    redFlags.push(`Potential dev wallet concentration (${input.holders.devWalletPercent.toFixed(1)}%)`);
  }

  score = Math.max(0, Math.min(100, score));

  // Confidence reflects data completeness so downstream consumers can reason about uncertainty.
  const confidence = Math.round((input.availableSources / Math.max(input.totalSources, 1)) * 100);

  return {
    score,
    label: labelFromScore(score),
    confidence,
    bullishSignals,
    redFlags,
  };
}
