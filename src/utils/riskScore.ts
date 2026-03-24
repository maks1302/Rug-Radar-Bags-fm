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
  const redFlagDetails: RiskAssessment["redFlagDetails"] = [];

  const addRedFlag = (flag: string, impact: string) => {
    redFlags.push(flag);
    redFlagDetails.push({ flag, impact });
  };

  const top10 = input.holders.top10Percent;
  if (top10 !== null) {
    if (top10 > 80) {
      score += 35;
      addRedFlag(
        `Top 10 holders control ${top10.toFixed(1)}% of supply`,
        "A small group can move price or dump into thin liquidity quickly.",
      );
    } else if (top10 > 60) {
      score += 25;
      addRedFlag(
        `Top 10 holders concentration is high at ${top10.toFixed(1)}%`,
        "Distribution risk is elevated, so a few wallets can still dominate market behavior.",
      );
    } else if (top10 > 40) {
      score += 15;
      addRedFlag(
        `Top 10 holders concentration is moderate at ${top10.toFixed(1)}%`,
        "Supply is not broadly distributed yet, which can amplify volatility.",
      );
    } else {
      bullishSignals.push(`Top 10 holder concentration is healthier at ${top10.toFixed(1)}%`);
    }
  } else {
    addRedFlag("Holder concentration unavailable", "You are missing one of the highest-signal checks for distribution risk.");
  }

  const liq = input.market.liquidity;
  if (liq !== null) {
    if (liq < 10_000) {
      score += 25;
      addRedFlag(
        `Liquidity is very thin ($${Math.round(liq).toLocaleString()})`,
        "Small sells can move price sharply and exits may be difficult during stress.",
      );
    } else if (liq < 50_000) {
      score += 18;
      addRedFlag(
        `Liquidity is low ($${Math.round(liq).toLocaleString()})`,
        "Price impact is still meaningful, especially if sentiment turns quickly.",
      );
    } else if (liq < 200_000) {
      score += 10;
      addRedFlag(
        `Liquidity is moderate ($${Math.round(liq).toLocaleString()})`,
        "Liquidity is usable, but not deep enough to fully absorb fast exits or large buys.",
      );
    } else {
      bullishSignals.push(`Liquidity depth is strong ($${Math.round(liq).toLocaleString()})`);
    }
  } else {
    addRedFlag("Liquidity data unavailable", "Without liquidity context, slippage and exit risk are harder to judge.");
  }

  if (input.contract.isHoneypot) {
    score += 25;
    addRedFlag("Honeypot behavior detected", "Buying may be possible while selling or exiting is restricted.");
  } else if (input.contract.isHoneypot === false) {
    bullishSignals.push("No honeypot behavior detected");
  }

  if (input.contract.mintAuthority) {
    score += 10;
    addRedFlag("Mint authority still active", "Supply can still be expanded, which can dilute holders or pressure price.");
  } else if (input.contract.mintAuthority === false) {
    bullishSignals.push("Mint authority appears renounced");
  }

  if (input.contract.freezeAuthority) {
    score += 8;
    addRedFlag("Freeze authority still active", "The token owner may still be able to restrict transfers or freeze accounts.");
  } else if (input.contract.freezeAuthority === false) {
    bullishSignals.push("Freeze authority appears disabled");
  }

  if (input.contract.isVerified === false) {
    score += 5;
    addRedFlag("Contract is not verified", "Auditing behavior and permissions is harder when source verification is missing.");
  } else if (input.contract.isVerified === true) {
    bullishSignals.push("Contract verified");
  }

  if (input.tokenAgeMs !== null) {
    const dayMs = 24 * 60 * 60 * 1000;
    if (input.tokenAgeMs < dayMs) {
      score += 10;
      addRedFlag("Token is less than 24 hours old", "Very new launches have the least price history and the highest failure rate.");
    } else if (input.tokenAgeMs < 7 * dayMs) {
      score += 7;
      addRedFlag("Token is less than 7 days old", "The token has not yet survived enough time to prove durability.");
    } else if (input.tokenAgeMs < 30 * dayMs) {
      score += 3;
      addRedFlag("Token is relatively new (<30 days)", "Early-stage tokens can still change structure and holder profile quickly.");
    } else {
      bullishSignals.push("Token has survived beyond 30 days");
    }
  }

  if (input.volumeConsistencyRisk) {
    score += 5;
    addRedFlag(
      "Volume pattern suggests a short-lived spike",
      "Trading activity may be less organic than it appears, which can make momentum unreliable.",
    );
  } else {
    bullishSignals.push("Volume trend appears organic");
  }

  if (input.holders.devWalletPercent !== null && input.holders.devWalletPercent > 10) {
    const bump = Math.min(8, Math.round(input.holders.devWalletPercent / 2));
    score += bump;
    addRedFlag(
      `Potential dev wallet concentration (${input.holders.devWalletPercent.toFixed(1)}%)`,
      "A likely insider wallet still has enough supply to affect trust and market balance.",
    );
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
    redFlagDetails,
  };
}
