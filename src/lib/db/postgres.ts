import { Pool, PoolConfig } from "pg";

let pool: Pool | null = null;

export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0;
}

export function getDbPool(): Pool {
  if (!pool) {
    const databaseUrl =
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/metamindful";

    const isCloud =
      databaseUrl.includes("sslmode=require") ||
      databaseUrl.includes("supabase") ||
      databaseUrl.includes("neon.tech") ||
      databaseUrl.includes("pooler.supabase.com") ||
      process.env.NODE_ENV === "production";

    const config: PoolConfig = {
      connectionString: databaseUrl,
      ssl: isCloud ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3500, // Fast failover to fallback if DB is not reachable
    };

    pool = new Pool(config);

    pool.on("error", (err) => {
      console.warn("[PostgreSQL Pool Error]", err.message);
    });
  }

  return pool;
}

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const p = getDbPool();
  const res = await p.query(text, params);
  return res.rows as T[];
}
