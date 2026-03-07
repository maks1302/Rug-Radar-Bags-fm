export function formatAgeFromTimestamp(timestampMs: number | null): string {
  if (!timestampMs) return "unknown";
  const ageMs = Date.now() - timestampMs;
  if (ageMs <= 0) return "new";

  const days = Math.floor(ageMs / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days}d`;
  const hours = Math.floor(ageMs / (1000 * 60 * 60));
  if (hours > 0) return `${hours}h`;
  const minutes = Math.floor(ageMs / (1000 * 60));
  return `${Math.max(minutes, 1)}m`;
}

export function classifyConcentration(top10Percent: number | null): "Low" | "Medium" | "High" | "Unknown" {
  if (top10Percent === null) return "Unknown";
  if (top10Percent > 70) return "High";
  if (top10Percent > 45) return "Medium";
  return "Low";
}

export function safePct(value: number | null, digits = 2): number | null {
  if (value === null || Number.isNaN(value)) return null;
  return Number(value.toFixed(digits));
}

export function nowIso(): string {
  return new Date().toISOString();
}
