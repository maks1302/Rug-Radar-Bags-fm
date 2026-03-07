import { queryPg } from "./postgres.js";

export interface WatchThresholds {
  liquidityDropPercent: number;
  riskScoreIncrease: number;
  holderConcentrationIncrease: number;
  alertOnAuthorityChange: boolean;
  alertOnHoneypot: boolean;
}

export interface WatchlistRecord {
  id: number;
  userId: string;
  tokenAddress: string;
  rulesJson: WatchThresholds;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SnapshotRecord {
  id: number;
  tokenAddress: string;
  snapshotJson: Record<string, unknown>;
  riskScore: number | null;
  liquidity: number | null;
  top10Pct: number | null;
  fetchedAt: string;
}

interface WatchlistRow {
  id: number;
  user_id: string;
  token_address: string;
  rules_json: WatchThresholds;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface SnapshotRow {
  id: number;
  token_address: string;
  snapshot_json: Record<string, unknown>;
  risk_score: number | null;
  liquidity: string | null;
  top10_pct: string | null;
  fetched_at: string;
}

const DEFAULT_THRESHOLDS: WatchThresholds = {
  liquidityDropPercent: 20,
  riskScoreIncrease: 10,
  holderConcentrationIncrease: 5,
  alertOnAuthorityChange: true,
  alertOnHoneypot: true,
};

export function normalizeThresholds(input?: Partial<WatchThresholds>): WatchThresholds {
  return {
    liquidityDropPercent: input?.liquidityDropPercent ?? DEFAULT_THRESHOLDS.liquidityDropPercent,
    riskScoreIncrease: input?.riskScoreIncrease ?? DEFAULT_THRESHOLDS.riskScoreIncrease,
    holderConcentrationIncrease:
      input?.holderConcentrationIncrease ?? DEFAULT_THRESHOLDS.holderConcentrationIncrease,
    alertOnAuthorityChange: input?.alertOnAuthorityChange ?? DEFAULT_THRESHOLDS.alertOnAuthorityChange,
    alertOnHoneypot: input?.alertOnHoneypot ?? DEFAULT_THRESHOLDS.alertOnHoneypot,
  };
}

function mapWatchlistRow(row: WatchlistRow): WatchlistRecord {
  return {
    id: row.id,
    userId: row.user_id,
    tokenAddress: row.token_address,
    rulesJson: normalizeThresholds(row.rules_json),
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSnapshotRow(row: SnapshotRow): SnapshotRecord {
  return {
    id: row.id,
    tokenAddress: row.token_address,
    snapshotJson: row.snapshot_json,
    riskScore: row.risk_score,
    liquidity: row.liquidity === null ? null : Number(row.liquidity),
    top10Pct: row.top10_pct === null ? null : Number(row.top10_pct),
    fetchedAt: row.fetched_at,
  };
}

export async function upsertWatchlist(input: {
  userId: string;
  tokenAddress: string;
  rules: Partial<WatchThresholds>;
}): Promise<WatchlistRecord> {
  const rules = normalizeThresholds(input.rules);
  const res = await queryPg<WatchlistRow>(
    `
    INSERT INTO watchlists (user_id, token_address, rules_json, active)
    VALUES ($1, $2, $3::jsonb, true)
    ON CONFLICT (user_id, token_address)
    DO UPDATE SET rules_json = EXCLUDED.rules_json, active = true, updated_at = NOW()
    RETURNING id, user_id, token_address, rules_json, active, created_at, updated_at
    `,
    [input.userId, input.tokenAddress, JSON.stringify(rules)],
  );

  return mapWatchlistRow(res.rows[0]!);
}

export async function listActiveWatchlists(tokenAddress: string, userId?: string): Promise<WatchlistRecord[]> {
  const res = userId
    ? await queryPg<WatchlistRow>(
        `
        SELECT id, user_id, token_address, rules_json, active, created_at, updated_at
        FROM watchlists
        WHERE token_address = $1 AND active = true AND user_id = $2
        `,
        [tokenAddress, userId],
      )
    : await queryPg<WatchlistRow>(
        `
        SELECT id, user_id, token_address, rules_json, active, created_at, updated_at
        FROM watchlists
        WHERE token_address = $1 AND active = true
        `,
        [tokenAddress],
      );

  return res.rows.map(mapWatchlistRow);
}

export async function getLatestSnapshot(tokenAddress: string): Promise<SnapshotRecord | null> {
  const res = await queryPg<SnapshotRow>(
    `
    SELECT id, token_address, snapshot_json, risk_score, liquidity, top10_pct, fetched_at
    FROM token_snapshots
    WHERE token_address = $1
    ORDER BY fetched_at DESC
    LIMIT 1
    `,
    [tokenAddress],
  );

  return res.rowCount ? mapSnapshotRow(res.rows[0]!) : null;
}

export async function insertSnapshot(input: {
  tokenAddress: string;
  snapshot: Record<string, unknown>;
  riskScore: number | null;
  liquidity: number | null;
  top10Pct: number | null;
}): Promise<SnapshotRecord> {
  const res = await queryPg<SnapshotRow>(
    `
    INSERT INTO token_snapshots (token_address, snapshot_json, risk_score, liquidity, top10_pct)
    VALUES ($1, $2::jsonb, $3, $4, $5)
    RETURNING id, token_address, snapshot_json, risk_score, liquidity, top10_pct, fetched_at
    `,
    [input.tokenAddress, JSON.stringify(input.snapshot), input.riskScore, input.liquidity, input.top10Pct],
  );

  return mapSnapshotRow(res.rows[0]!);
}

export async function insertAlert(input: {
  watchlistId: number;
  tokenAddress: string;
  triggerType: string;
  triggerDetail: string;
  dedupeKey: string;
}): Promise<void> {
  await queryPg(
    `
    INSERT INTO alerts (watchlist_id, token_address, trigger_type, trigger_detail, dedupe_key)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (dedupe_key) DO NOTHING
    `,
    [input.watchlistId, input.tokenAddress, input.triggerType, input.triggerDetail, input.dedupeKey],
  );
}

export async function insertToolEvent(input: {
  toolName: string;
  userId: string;
  tokenAddress?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  await queryPg(
    `
    INSERT INTO tool_events (tool_name, user_id, token_address, meta_json)
    VALUES ($1, $2, $3, $4::jsonb)
    `,
    [input.toolName, input.userId, input.tokenAddress ?? null, JSON.stringify(input.meta ?? {})],
  );
}
