import { analyzeToken } from "./analyzeToken.js";
import { isLikelySolanaAddress, normalizeInput } from "../utils/validators.js";
import type { ScanRiskResult } from "../types/index.js";

interface ScanRiskInput {
  token_address: string;
}

function deriveRiskLevel(score: number): ScanRiskResult["riskLevel"] {
  if (score <= 25) return "Low";
  if (score <= 50) return "Medium";
  if (score <= 75) return "High";
  return "Extreme";
}

export async function scanRisk(input: ScanRiskInput): Promise<ScanRiskResult> {
  const address = normalizeInput(input.token_address);
  if (!isLikelySolanaAddress(address)) {
    throw new Error("Invalid Solana token address format");
  }

  const token = await analyzeToken({ token_address: address });

  const flagsTriggered: ScanRiskResult["flagsTriggered"] = [];
  const flagsPassed: ScanRiskResult["flagsPassed"] = [];

  const check = (condition: boolean, flag: string, severity: "Low" | "Medium" | "High" | "Extreme", detail: string, passDetail: string) => {
    if (condition) {
      flagsTriggered.push({ flag, severity, detail });
    } else {
      flagsPassed.push({ flag, detail: passDetail });
    }
  };

  check(
    (token.holders.top10Percent ?? 0) > 60,
    "Top 10 wallets hold >60%",
    "High",
    `Top 10 hold ${token.holders.top10Percent?.toFixed(1) ?? "unknown"}%`,
    "Top 10 concentration is below 60%",
  );

  check(
    token.contract.lpUnlocked === true,
    "LP unlocked or unburned",
    "High",
    "Liquidity appears unlockable or unburned",
    "LP appears locked or burned",
  );

  check(
    token.contract.mintAuthority === true,
    "Mint authority active",
    "High",
    "Mint authority still active",
    "Mint authority appears renounced",
  );

  check(
    token.contract.freezeAuthority === true,
    "Freeze authority active",
    "Medium",
    "Freeze authority still active",
    "Freeze authority appears disabled",
  );

  check(
    Boolean(token.market.volume24h && token.market.liquidity && token.market.volume24h > token.market.liquidity * 4),
    "Volume spike without organic growth",
    "Medium",
    "24h volume is disproportionately high vs liquidity",
    "Volume/liquidity ratio looks healthier",
  );

  const ageRaw = token.token.age;
  const isUnder7Days = ageRaw.endsWith("h") || ageRaw.endsWith("m") || (ageRaw.endsWith("d") && Number(ageRaw.replace("d", "")) < 7);
  check(isUnder7Days, "Token age under 7 days", "Medium", `Token age is ${token.token.age}`, "Token age exceeds 7 days");

  check(
    token.contract.isHoneypot === true,
    "Honeypot detected",
    "Extreme",
    "RugCheck signals honeypot behavior",
    "No honeypot behavior detected",
  );

  check(
    (token.holders.largestHolder ?? 0) > 15,
    "Dev wallet still holding large %",
    "High",
    `Largest wallet holds ${token.holders.largestHolder?.toFixed(1) ?? "unknown"}%`,
    "Largest single wallet share is below 15%",
  );

  check(
    token.risk.redFlags.some((f) => f.toLowerCase().includes("cluster")) || token.risk.redFlags.some((f) => f.toLowerCase().includes("concentration")),
    "Suspicious wallet clustering",
    "Medium",
    "Holder wallet profile suggests clustering/concentration risk",
    "No clear clustering signal detected",
  );

  check(
    (token.market.liquidity ?? Number.MAX_SAFE_INTEGER) < 50_000,
    "Liquidity under $50k",
    "High",
    `Liquidity is $${Math.round(token.market.liquidity ?? 0).toLocaleString()}`,
    "Liquidity is at least $50k",
  );

  const score = token.risk.score;
  const riskLevel = deriveRiskLevel(score);
  const verdict =
    flagsTriggered.length === 0
      ? "No major risk flags were triggered, but continue monitoring before entry."
      : `${flagsTriggered.length} risk flags triggered. Prioritize position sizing and verify holder/contract data before trading.`;

  return {
    token: {
      address: token.token.address,
      symbol: token.token.symbol,
    },
    riskLevel,
    score,
    flagsTriggered,
    flagsPassed,
    verdict,
    meta: {
      fetchedAt: token.meta.fetchedAt,
      dataSources: token.meta.dataSources,
    },
  };
}
