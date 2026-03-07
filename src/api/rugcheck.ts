import { getJsonWithCache } from "../utils/http.js";

interface RugCheckDynamic {
  score?: number;
  tokenMeta?: {
    symbol?: string;
    name?: string;
  };
  isVerified?: boolean;
  verification?: {
    verified?: boolean;
  };
  token?: {
    mintAuthority?: string | null;
    freezeAuthority?: string | null;
  };
  mintAuthority?: string | null;
  freezeAuthority?: string | null;
  risks?: Array<{ name?: string; description?: string; level?: string }>;
  warnings?: string[];
  honeypot?: boolean;
  isHoneypot?: boolean;
  markets?: {
    lpUnlocked?: boolean;
    lpBurned?: boolean;
  };
}

export interface RugCheckSnapshot {
  isVerified: boolean | null;
  isHoneypot: boolean | null;
  mintAuthority: boolean | null;
  freezeAuthority: boolean | null;
  rugScore: number | null;
  lpUnlocked: boolean | null;
  warnings: string[];
}

function truthyString(value: unknown): boolean {
  return typeof value === "string" && value.length > 0;
}

export async function fetchRugCheck(address: string): Promise<RugCheckSnapshot | null> {
  const url = `https://api.rugcheck.xyz/v1/tokens/${address}/report`;
  const data = await getJsonWithCache<RugCheckDynamic>(`rugcheck:${address}`, url);

  const mintAuthorityRaw = data.token?.mintAuthority ?? data.mintAuthority;
  const freezeAuthorityRaw = data.token?.freezeAuthority ?? data.freezeAuthority;

  const riskText = (data.risks ?? []).map((r) => `${r.name ?? "risk"}: ${r.description ?? ""}`.trim());
  const warnings = [...riskText, ...(data.warnings ?? [])];

  return {
    isVerified: data.isVerified ?? data.verification?.verified ?? null,
    isHoneypot: data.isHoneypot ?? data.honeypot ?? null,
    mintAuthority: mintAuthorityRaw === null ? false : truthyString(mintAuthorityRaw),
    freezeAuthority: freezeAuthorityRaw === null ? false : truthyString(freezeAuthorityRaw),
    rugScore: typeof data.score === "number" ? data.score : null,
    lpUnlocked: data.markets?.lpUnlocked ?? (typeof data.markets?.lpBurned === "boolean" ? !data.markets.lpBurned : null),
    warnings,
  };
}
