import { Pool, type QueryResult, type QueryResultRow } from "pg";

let pool: Pool | null = null;

export function getPgPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing");
  }

  pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 8_000,
    ssl: connectionString.includes("neon.tech")
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
  });

  pool.on("error", (error) => {
    console.error("[db] Unexpected PG pool error", error);
  });

  return pool;
}

export async function queryPg<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<QueryResult<T>> {
  const client = getPgPool();
  const start = Date.now();
  try {
    const res = await client.query<T>(text, values);
    return res;
  } catch (error) {
    console.error(`[db] query failed in ${Date.now() - start}ms`, { text, error });
    throw error;
  }
}
