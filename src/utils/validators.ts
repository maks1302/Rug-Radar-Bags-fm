const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;

export function isLikelySolanaAddress(value: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length >= 32 && trimmed.length <= 44 && BASE58_REGEX.test(trimmed);
}

export function normalizeInput(value: string): string {
  return value.trim();
}

export function requireOneOf(inputs: Record<string, string | undefined>): string | null {
  const hasAny = Object.values(inputs).some((v) => Boolean(v && v.trim().length > 0));
  if (!hasAny) {
    return `Provide at least one of: ${Object.keys(inputs).join(", ")}`;
  }
  return null;
}
