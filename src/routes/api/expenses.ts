import { createFileRoute } from "@tanstack/react-router";

import { apiRoute } from "@/server/handler.server";

import { query, transaction } from "@/server/db.server";
import { json, requireUser, unauthorized } from "@/server/auth.server";
import { rateLimit, tooManyRequests } from "@/server/rate-limit.server";
import { checkExpenseQuota, quotaResponse } from "@/server/plans.server";
import { ownedAccountId } from "@/server/ledger.server";

const CATEGORIES = new Set([
  "Food",
  "Travel",
  "Education",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
]);

/** Hard cap per request. Bigger imports are chunked by the client. */
const MAX_BATCH = 500;
const MAX_PAGE = 100;

type IncomingEntry = {
  amount?: unknown;
  category?: unknown;
  merchant?: unknown;
  note?: unknown;
  type?: unknown;
  occurredAt?: unknown;
  accountId?: unknown;
};

/**
 * Validates a client-supplied date.
 *
 * Rejects unparseable values, anything in the future, and anything before
 * 2000 — a bad date would silently land the expense outside the current
 * month and quietly corrupt the monthly totals and quota counts.
 */
function parseOccurredAt(value: unknown): Date | null {
  if (value === undefined || value === null || value === "") return null;

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;

  const now = Date.now();
  // Allow a day of slack for timezone differences between client and server.
  if (date.getTime() > now + 86_400_000) return null;
  if (date.getFullYear() < 2000) return null;

  return date;
}

export const Route = createFileRoute("/api/expenses")({
  server: {
    handlers: {
      /**
       * Keyset pagination — never OFFSET.
       *
       * OFFSET makes page N cost O(N): at 10GB, page 5000 would scan
       * millions of rows. Seeking on (occurred_at, id) uses the index
       * directly, so page 5000 costs exactly what page 1 costs.
       */
      GET: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        const url = new URL(request.url);
        const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), MAX_PAGE);
        const cursor = url.searchParams.get("cursor");

        let rows;
        if (cursor) {
          // cursor = "<iso timestamp>|<id>"
          const [ts, id] = cursor.split("|");
          if (!ts || !id) return json({ error: "Bad cursor." }, { status: 400 });
          rows = await query(
            `SELECT id, amount, category, merchant, note, kind, occurred_at
               FROM expenses
              WHERE user_id = $1 AND (occurred_at, id) < ($2::timestamptz, $3::bigint)
              ORDER BY occurred_at DESC, id DESC
              LIMIT $4`,
            [user.id, ts, id, limit],
          );
        } else {
          rows = await query(
            `SELECT id, amount, category, merchant, note, kind, occurred_at
               FROM expenses
              WHERE user_id = $1
              ORDER BY occurred_at DESC, id DESC
              LIMIT $2`,
            [user.id, limit],
          );
        }

        const entries = (
          rows as Array<{
            id: string;
            amount: string;
            category: string;
            merchant: string | null;
            note: string;
            kind: string;
            occurred_at: Date;
          }>
        ).map((r) => ({
          id: String(r.id),
          amount: Number(r.amount),
          category: r.category,
          merchant: r.merchant,
          note: r.note,
          type: r.kind,
          occurredAt: r.occurred_at.toISOString(),
        }));

        const last = entries[entries.length - 1];
        const nextCursor =
          entries.length === limit && last ? `${last.occurredAt}|${last.id}` : null;

        return json({ entries, nextCursor });
      }),

      /** Bulk insert. One transaction, one parameterised statement. */
      POST: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        const limit = rateLimit(`expenses:write:${user.id}`, 120, 60_000);
        if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

        const contentLength = request.headers.get("content-length");
        if (contentLength && Number(contentLength) > 512_000) {
          return json({ error: "Payload too large." }, { status: 413 });
        }

        let body: { entries?: unknown };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request." }, { status: 400 });
        }

        if (!Array.isArray(body.entries))
          return json({ error: "entries must be an array." }, { status: 400 });
        if (body.entries.length === 0) return json({ inserted: 0 });
        if (body.entries.length > MAX_BATCH)
          return json({ error: `Send at most ${MAX_BATCH} entries per request.` }, { status: 400 });

        const clean: {
          amount: number;
          category: string;
          merchant: string | null;
          note: string;
          kind: string;
          occurredAt: Date | null;
          accountId: string | null;
        }[] = [];

        for (const raw of body.entries as IncomingEntry[]) {
          if (!raw || typeof raw !== "object") continue;
          const amount = Number(raw.amount);
          if (!Number.isFinite(amount) || amount <= 0 || amount > 99_999_999) continue;

          const category = CATEGORIES.has(String(raw.category)) ? String(raw.category) : "Other";
          const merchantRaw = raw.merchant == null ? null : String(raw.merchant).slice(0, 80);
          const note = String(raw.note ?? "").slice(0, 280);
          const kind = raw.type === "income" ? "income" : "expense";

          clean.push({
            amount: Math.round(amount * 100) / 100,
            category,
            merchant: merchantRaw || null,
            note,
            kind,
            occurredAt: parseOccurredAt(raw.occurredAt),
            // Resolved below — ownership must be verified against the DB.
            accountId: null,
          });
        }

        if (clean.length === 0) return json({ inserted: 0 });

        // All entries in one request share an account. Verified against the
        // DB so a forged id cannot attach an expense to someone else's account.
        const bodyAccountId = (body as { accountId?: unknown }).accountId;
        const resolvedAccount = await ownedAccountId(user.id, bodyAccountId);
        for (const entry of clean) entry.accountId = resolvedAccount;

        // Free plan caps expenses per calendar month.
        const overQuota = await checkExpenseQuota(user.id, user.plan, clean.length);
        if (overQuota) return quotaResponse(overQuota);

        // Build a single multi-row INSERT with bound parameters.
        const values: unknown[] = [];
        const tuples = clean.map((entry, i) => {
          const base = i * 7;
          values.push(
            entry.amount,
            entry.category,
            entry.merchant,
            entry.note,
            entry.kind,
            entry.occurredAt,
            entry.accountId,
          );
          return `($${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`;
        });

        // Explicit casts are required: Postgres cannot infer parameter types
        // inside a VALUES-derived table and defaults them all to text, which
        // fails against the numeric `amount` column.
        await transaction(async (client) => {
          await client.query(
            `INSERT INTO expenses
               (user_id, amount, category, merchant, note, kind, occurred_at, account_id)
             SELECT $1::uuid,
                    v.amount::numeric,
                    v.category::text,
                    v.merchant::text,
                    v.note::text,
                    v.kind::text,
                    COALESCE(v.occurred_at::timestamptz, now()),
                    v.account_id::bigint
               FROM (VALUES ${tuples.join(", ")})
                 AS v(amount, category, merchant, note, kind, occurred_at, account_id)`,
            [user.id, ...values],
          );
        });

        return json({ inserted: clean.length });
      }),

      /** Clear this user's ledger. */
      DELETE: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        const limit = rateLimit(`expenses:clear:${user.id}`, 5, 60_000);
        if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

        await query("DELETE FROM expenses WHERE user_id = $1", [user.id]);
        return json({ ok: true });
      }),
    },
  },
});
