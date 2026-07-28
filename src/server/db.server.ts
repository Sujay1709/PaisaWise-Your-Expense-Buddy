/**
 * Postgres connection pool + schema migrations.
 *
 * Design notes for scale:
 *  - Every table that grows is indexed on (user_id, ...) so no query ever
 *    scans the whole table. A 10GB expenses table still answers a user's
 *    dashboard in milliseconds.
 *  - statement_timeout caps runaway queries so one bad request cannot
 *    pin a connection forever.
 *  - The pool is bounded; excess requests queue instead of opening
 *    unbounded connections and exhausting Postgres.
 */

import { Pool, type PoolClient } from "pg";

let pool: Pool | null = null;
let migrationPromise: Promise<void> | null = null;

/**
 * Decides how to use TLS.
 *
 * SECURITY: `rejectUnauthorized: false` encrypts the connection but does NOT
 * authenticate the server, so anything on the network path can present its own
 * certificate and read every query — credentials and user financial data
 * included. That is acceptable only on a provider's private network.
 *
 * Preference order:
 *   1. DATABASE_CA_CERT set  -> verify against that CA (fully secure)
 *   2. Neon / Supabase       -> verify against the public CA store; both use
 *                               publicly trusted certificates
 *   3. Local Postgres        -> no TLS (usually not enabled locally)
 *   4. Anything else         -> encrypt without verification, and warn loudly
 *
 * Override with `?sslmode=disable` or `?sslmode=no-verify` in the URL.
 */
function resolveSsl(connectionString: string) {
  if (/[?&]sslmode=disable/.test(connectionString)) return undefined;

  const isLocal = /@(localhost|127\.0\.0\.1|\[::1\]|host\.docker\.internal)[:/]/.test(
    connectionString,
  );
  if (isLocal) return undefined;

  // 1. Explicit CA — the correct configuration for any provider.
  const ca = process.env.DATABASE_CA_CERT;
  if (ca) {
    return { rejectUnauthorized: true, ca: ca.replace(/\\n/g, "\n") };
  }

  const forcedNoVerify = /[?&]sslmode=no-verify/.test(connectionString);

  // 2. Providers that use publicly trusted certificates verify normally.
  const publiclyTrusted = /@[^/]*\.(neon\.tech|supabase\.co|aws\.neon\.build)/.test(
    connectionString,
  );
  if (publiclyTrusted && !forcedNoVerify) {
    return { rejectUnauthorized: true };
  }

  // 3. Fallback: encrypted but unverified. Say so out loud.
  if (!forcedNoVerify) {
    console.warn(
      "[db] TLS certificate verification is DISABLED for this host. The " +
        "connection is encrypted but not authenticated. Set DATABASE_CA_CERT " +
        "to your provider's CA certificate to close this gap.",
    );
  }
  return { rejectUnauthorized: false };
}

export function getPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add a Postgres service in Railway and reference it as DATABASE_URL.",
    );
  }

  pool = new Pool({
    connectionString,
    ssl: resolveSsl(connectionString),
    max: Number(process.env.PG_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    // Kill any single query that runs longer than 15s.
    statement_timeout: 15_000,
    query_timeout: 15_000,
  });

  pool.on("error", (err: Error) => {
    console.error("[db] idle client error", err);
  });

  return pool;
}

/** Runs a query using the shared pool. */
export async function query<T = unknown>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensureMigrated();
  const result = await getPool().query(text, params as never[]);
  return result.rows as T[];
}

/** Runs several statements inside a single transaction. */
export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  await ensureMigrated();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

// ─── Migrations ─────────────────────────────────────────────────
// Idempotent. Safe to run on every boot and on every instance.

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email          text NOT NULL,
  name           text NOT NULL,
  password_hash  text NOT NULL,
  password_salt  text NOT NULL,
  bio            text NOT NULL DEFAULT '',
  gender         text NOT NULL DEFAULT '',
  avatar_color   text NOT NULL DEFAULT '#e8a838',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Emails are stored lowercased; this enforces one account per address.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (email);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash  text PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS expenses (
  id          bigserial PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      numeric(12,2) NOT NULL CHECK (amount > 0),
  category    text NOT NULL,
  merchant    text,
  note        text NOT NULL DEFAULT '',
  kind        text NOT NULL DEFAULT 'expense' CHECK (kind IN ('expense','income')),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- The workhorse index: every dashboard query filters by user_id first.
CREATE INDEX IF NOT EXISTS expenses_user_time_idx
  ON expenses (user_id, occurred_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS expenses_user_category_idx
  ON expenses (user_id, category);

CREATE TABLE IF NOT EXISTS user_chats (
  user_id    uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  messages   jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Billing ────────────────────────────────────────────────────
-- Added in 3.2.0. ALTER ... IF NOT EXISTS keeps this safe to re-run
-- against a database created by an earlier version.
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_since timestamptz;

-- Metered actions that are not rows in another table (AI calls, receipt
-- scans). Expense counts come from the expenses table directly.
CREATE TABLE IF NOT EXISTS usage_events (
  id          bigserial PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind        text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

-- Quota checks always filter user + kind + time window.
CREATE INDEX IF NOT EXISTS usage_user_kind_time_idx
  ON usage_events (user_id, kind, occurred_at DESC);
`;

export function ensureMigrated(): Promise<void> {
  if (migrationPromise) return migrationPromise;

  migrationPromise = (async () => {
    const client = await getPool().connect();
    try {
      // An advisory lock stops two Railway instances migrating at once.
      await client.query("SELECT pg_advisory_lock($1)", [727_2026]);
      try {
        await client.query(MIGRATION_SQL);
        console.log("[db] schema ready");
      } finally {
        await client.query("SELECT pg_advisory_unlock($1)", [727_2026]);
      }
    } catch (error) {
      migrationPromise = null; // allow a retry on the next request
      throw error;
    } finally {
      client.release();
    }
  })();

  return migrationPromise;
}

/** Deletes expired sessions. Cheap because of sessions_expiry_idx. */
export async function purgeExpiredSessions(): Promise<number> {
  const rows = await query<{ count: string }>(
    "WITH d AS (DELETE FROM sessions WHERE expires_at < now() RETURNING 1) SELECT count(*)::text AS count FROM d",
  );
  return Number(rows[0]?.count ?? 0);
}

/** Closes the pool cleanly so Railway restarts do not drop in-flight work. */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    migrationPromise = null;
  }
}
