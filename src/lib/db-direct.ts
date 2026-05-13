import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    // Parse connection string to modify for SSL
    let url: URL;
    try {
      url = new URL(connectionString);
    } catch {
      throw new Error("Invalid DATABASE_URL");
    }

    // Remove sslmode from URL since we're handling it in Pool config
    url.searchParams.delete("sslmode");
    url.searchParams.delete("prepared_statement_cache");
    url.searchParams.delete("connection_limit");
    url.searchParams.delete("pool_timeout");

    pool = new Pool({
      connectionString: url.toString(),
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
    });
  }
  return pool;
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

export async function disconnect() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}