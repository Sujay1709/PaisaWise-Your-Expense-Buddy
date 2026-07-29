import { Pool } from "pg";
//#region src/lib/error-capture.ts
var lastCapturedError;
var TTL_MS = 5e3;
function record(error) {
	lastCapturedError = {
		error,
		at: Date.now()
	};
}
var CAUSE_DEPTH_LIMIT = 5;
var DESCRIPTION_LENGTH_LIMIT = 8e3;
function describeError(error) {
	const parts = [];
	let current = error;
	for (let depth = 0; depth < CAUSE_DEPTH_LIMIT && current != null; depth++) {
		if (!(current instanceof Error)) {
			parts.push(typeof current === "string" ? current : safeStringify(current));
			break;
		}
		const label = depth === 0 ? "" : "caused by: ";
		const status = describeStatus(current);
		parts.push(`${label}${current.stack ?? `${current.name}: ${current.message}`}${status}`);
		current = current.cause;
	}
	return parts.join("\n").slice(0, DESCRIPTION_LENGTH_LIMIT);
}
function describeStatus(error) {
	const { status, statusCode } = error;
	const value = status ?? statusCode;
	return typeof value === "number" ? ` (status ${value})` : "";
}
function safeStringify(value) {
	try {
		return JSON.stringify(value) ?? String(value);
	} catch {
		return String(value);
	}
}
function isErrorLike(value) {
	return value instanceof Error;
}
var originalConsoleError = console.error.bind(console);
console.error = (...args) => {
	originalConsoleError(...args.map((arg) => {
		if (!isErrorLike(arg)) return arg;
		record(arg);
		return describeError(arg);
	}));
};
if (typeof globalThis.addEventListener === "function") {
	globalThis.addEventListener("error", (event) => record(event.error ?? event));
	globalThis.addEventListener("unhandledrejection", (event) => record(event.reason));
}
function consumeLastCapturedError() {
	if (!lastCapturedError) return void 0;
	if (Date.now() - lastCapturedError.at > TTL_MS) {
		lastCapturedError = void 0;
		return;
	}
	const { error } = lastCapturedError;
	lastCapturedError = void 0;
	return error;
}
//#endregion
//#region src/lib/error-page.ts
function renderErrorPage() {
	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
//#endregion
//#region src/server/db.server.ts
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
var pool = null;
var migrationPromise = null;
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
function resolveSsl(connectionString) {
	if (/[?&]sslmode=disable/.test(connectionString)) return void 0;
	if (/@(localhost|127\.0\.0\.1|\[::1\]|host\.docker\.internal)[:/]/.test(connectionString)) return void 0;
	const ca = process.env.DATABASE_CA_CERT;
	if (ca) return {
		rejectUnauthorized: true,
		ca: ca.replace(/\\n/g, "\n")
	};
	const forcedNoVerify = /[?&]sslmode=no-verify/.test(connectionString);
	if (/@[^/]*\.(neon\.tech|supabase\.co|aws\.neon\.build)/.test(connectionString) && !forcedNoVerify) return { rejectUnauthorized: true };
	if (!forcedNoVerify) console.warn("[db] TLS certificate verification is DISABLED for this host. The connection is encrypted but not authenticated. Set DATABASE_CA_CERT to your provider's CA certificate to close this gap.");
	return { rejectUnauthorized: false };
}
function getPool() {
	if (pool) return pool;
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) throw new Error("DATABASE_URL is not set. Add a Postgres service in Railway and reference it as DATABASE_URL.");
	pool = new Pool({
		connectionString,
		ssl: resolveSsl(connectionString),
		max: Number(process.env.PG_POOL_MAX ?? 10),
		idleTimeoutMillis: 3e4,
		connectionTimeoutMillis: 1e4,
		statement_timeout: 15e3,
		query_timeout: 15e3
	});
	pool.on("error", (err) => {
		console.error("[db] idle client error", err);
	});
	return pool;
}
/** Runs a query using the shared pool. */
async function query(text, params = []) {
	await ensureMigrated();
	return (await getPool().query(text, params)).rows;
}
/** Runs several statements inside a single transaction. */
async function transaction(fn) {
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
var MIGRATION_SQL = `
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

-- ── Accounts ───────────────────────────────────────────────────
-- Where the money came from: cash, bank, a UPI wallet, a card.
CREATE TABLE IF NOT EXISTS accounts (
  id         bigserial PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  kind       text NOT NULL DEFAULT 'cash'
             CHECK (kind IN ('cash','bank','upi','card','wallet')),
  color      text NOT NULL DEFAULT '#e8a838',
  archived   boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS accounts_user_idx ON accounts (user_id, archived);
CREATE UNIQUE INDEX IF NOT EXISTS accounts_user_name_key
  ON accounts (user_id, lower(name));

-- Deleting an account must not delete its history, so SET NULL, not CASCADE.
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS account_id bigint
  REFERENCES accounts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS expenses_user_account_idx ON expenses (user_id, account_id);

-- ── Custom categories ──────────────────────────────────────────
-- expenses.category stays TEXT rather than becoming a foreign key. The AI
-- parser and receipt scanner emit category *names*, and denormalising means
-- renaming or deleting a category never orphans or rewrites history.
CREATE TABLE IF NOT EXISTS categories (
  id         bigserial PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  emoji      text NOT NULL DEFAULT '📦',
  color      text NOT NULL DEFAULT '#e8a838',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS categories_user_name_key
  ON categories (user_id, lower(name));

-- ── Budgets ────────────────────────────────────────────────────
-- One monthly cap per category. Proactive, unlike leak detection which
-- only tells you after the money is gone.
CREATE TABLE IF NOT EXISTS budgets (
  id         bigserial PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category   text NOT NULL,
  amount     numeric(12,2) NOT NULL CHECK (amount > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS budgets_user_category_key
  ON budgets (user_id, lower(category));

-- ── Recurring transactions ─────────────────────────────────────
-- Rent, hostel fees, subscriptions. next_run is a DATE so catch-up is
-- idempotent: a row is only materialised once per due date.
CREATE TABLE IF NOT EXISTS recurring (
  id         bigserial PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount     numeric(12,2) NOT NULL CHECK (amount > 0),
  category   text NOT NULL,
  merchant   text,
  note       text NOT NULL DEFAULT '',
  kind       text NOT NULL DEFAULT 'expense'
             CHECK (kind IN ('expense','income')),
  account_id bigint REFERENCES accounts(id) ON DELETE SET NULL,
  cadence    text NOT NULL CHECK (cadence IN ('daily','weekly','monthly')),
  next_run   date NOT NULL,
  active     boolean NOT NULL DEFAULT true,
  last_run   date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS recurring_due_idx
  ON recurring (user_id, active, next_run);
`;
function ensureMigrated() {
	if (migrationPromise) return migrationPromise;
	migrationPromise = (async () => {
		const client = await getPool().connect();
		try {
			await client.query("SELECT pg_advisory_lock($1)", [7272026]);
			try {
				await client.query(MIGRATION_SQL);
				console.log("[db] schema ready");
			} finally {
				await client.query("SELECT pg_advisory_unlock($1)", [7272026]);
			}
		} catch (error) {
			migrationPromise = null;
			throw error;
		} finally {
			client.release();
		}
	})();
	return migrationPromise;
}
/** Deletes expired sessions. Cheap because of sessions_expiry_idx. */
async function purgeExpiredSessions() {
	const rows = await query("WITH d AS (DELETE FROM sessions WHERE expires_at < now() RETURNING 1) SELECT count(*)::text AS count FROM d");
	return Number(rows[0]?.count ?? 0);
}
/** Closes the pool cleanly so Railway restarts do not drop in-flight work. */
async function closePool() {
	if (pool) {
		await pool.end();
		pool = null;
		migrationPromise = null;
	}
}
//#endregion
//#region src/server.ts
if (process.env.DATABASE_URL) {
	ensureMigrated().then(() => purgeExpiredSessions()).then((purged) => {
		if (purged > 0) console.log(`[db] purged ${purged} expired sessions`);
	}).catch((error) => console.error("[db] startup migration failed", error));
	setInterval(() => {
		purgeExpiredSessions().catch((error) => console.error("[db] session purge failed", error));
	}, 3600 * 1e3).unref?.();
} else console.warn("[db] DATABASE_URL is not set — API routes will return errors.");
var shuttingDown = false;
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => {
	if (shuttingDown) return;
	shuttingDown = true;
	console.log(`[server] ${signal} received, closing database pool`);
	closePool().catch((error) => console.error("[server] pool close failed", error)).finally(() => process.exit(0));
});
var serverEntryPromise;
async function getServerEntry() {
	if (!serverEntryPromise) serverEntryPromise = import("./assets/server-BCu4H6wp.js").then((m) => m.default ?? m);
	return serverEntryPromise;
}
async function normalizeCatastrophicSsrResponse(response) {
	if (response.status < 500) return response;
	if (!(response.headers.get("content-type") ?? "").includes("application/json")) return response;
	const body = await response.clone().text();
	if (!isH3SwallowedErrorBody(body)) return response;
	console.error(consumeLastCapturedError() ?? /* @__PURE__ */ new Error(`h3 swallowed SSR error: ${body}`));
	return new Response(renderErrorPage(), {
		status: 500,
		headers: { "content-type": "text/html; charset=utf-8" }
	});
}
function isH3SwallowedErrorBody(body) {
	try {
		const payload = JSON.parse(body);
		return payload.unhandled === true && payload.message === "HTTPError";
	} catch {
		return false;
	}
}
var server_default = { async fetch(request, env, ctx) {
	try {
		return await normalizeCatastrophicSsrResponse(await (await getServerEntry()).fetch(request, env, ctx));
	} catch (error) {
		console.error(error);
		return new Response(renderErrorPage(), {
			status: 500,
			headers: { "content-type": "text/html; charset=utf-8" }
		});
	}
} };
//#endregion
export { server_default as default, renderErrorPage as i, query as n, transaction as r, getPool as t };
