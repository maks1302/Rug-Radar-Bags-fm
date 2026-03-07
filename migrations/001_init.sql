CREATE TABLE IF NOT EXISTS watchlists (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_address TEXT NOT NULL,
  rules_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, token_address)
);

CREATE TABLE IF NOT EXISTS token_snapshots (
  id BIGSERIAL PRIMARY KEY,
  token_address TEXT NOT NULL,
  snapshot_json JSONB NOT NULL,
  risk_score INT,
  liquidity NUMERIC,
  top10_pct NUMERIC,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_snapshots_token_fetched_at
  ON token_snapshots (token_address, fetched_at DESC);

CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  watchlist_id BIGINT NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  token_address TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_detail TEXT NOT NULL,
  dedupe_key TEXT NOT NULL UNIQUE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_token_sent_at
  ON alerts (token_address, sent_at DESC);

CREATE TABLE IF NOT EXISTS tool_events (
  id BIGSERIAL PRIMARY KEY,
  tool_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  token_address TEXT,
  meta_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_events_tool_created_at
  ON tool_events (tool_name, created_at DESC);
